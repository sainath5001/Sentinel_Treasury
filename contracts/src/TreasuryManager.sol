// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title TreasuryManager
/// @author Sentinel Treasury
/// @notice Manages the payment request lifecycle for the Sentinel Treasury platform.
/// @dev Holds treasury tokens and executes approved outbound payments after
///      compliance validation and human approval.
contract TreasuryManager is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // -------------------------------------------------------------------------
    // Roles
    // -------------------------------------------------------------------------

    /// @notice Role for agents or operators that create payment requests.
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    /// @notice Role for the compliance agent that validates payment requests.
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");

    /// @notice Role for human approvers authorized to sign off on payments.
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");

    // -------------------------------------------------------------------------
    // Types
    // -------------------------------------------------------------------------

    /// @notice Lifecycle states for a payment request.
    enum PaymentStatus {
        Pending,
        ComplianceApproved,
        Approved,
        Executed,
        Rejected
    }

    /// @notice A single outbound payment request tracked on-chain.
    /// @param id Unique request identifier (monotonically increasing).
    /// @param recipient Destination address for the payment.
    /// @param amount Token amount to transfer (treasury token decimals).
    /// @param description Human-readable purpose of the payment.
    /// @param status Current lifecycle state.
    /// @param createdAt Unix timestamp when the request was created.
    /// @param executedAt Unix timestamp when the payment was executed (0 if not executed).
    struct PaymentRequest {
        uint256 id;
        address recipient;
        uint256 amount;
        string description;
        PaymentStatus status;
        uint64 createdAt;
        uint64 executedAt;
    }

    // -------------------------------------------------------------------------
    // Storage
    // -------------------------------------------------------------------------

    /// @notice ERC-20 token held and disbursed by this contract.
    IERC20 public immutable treasuryToken;

    /// @notice Monotonically increasing request ID counter.
    uint256 private _nextRequestId;

    /// @notice Ordered list of all request IDs for enumeration.
    uint256[] private _requestIds;

    /// @notice Mapping from request ID to payment request data.
    mapping(uint256 id => PaymentRequest request) private _requests;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    /// @notice Emitted when a new payment request is created.
    event PaymentRequested(uint256 indexed id, address indexed recipient, uint256 amount, address indexed requester);

    /// @notice Emitted when compliance validation passes for a request.
    event ComplianceValidated(uint256 indexed id, address indexed validator, bool approved);

    /// @notice Emitted when a human approver grants approval.
    event ApprovalGranted(uint256 indexed id, address indexed approver);

    /// @notice Emitted when an approved payment is executed on-chain.
    event PaymentExecuted(uint256 indexed id, address indexed recipient, uint256 amount, address indexed executor);

    /// @notice Emitted when a payment request is rejected.
    event PaymentRejected(uint256 indexed id, address indexed rejector, PaymentStatus previousStatus);

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error ZeroAddress();
    error ZeroAmount();
    error EmptyDescription();
    error InvalidRequestId();
    error InvalidStatus(PaymentStatus current, PaymentStatus required);
    error InsufficientTreasuryBalance(uint256 available, uint256 required);
    error AlreadyTerminal(PaymentStatus status);

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    /// @notice Deploys the TreasuryManager and grants the admin all operational roles.
    /// @param admin Address that receives DEFAULT_ADMIN_ROLE and all operational roles.
    /// @param token ERC-20 token address managed by this contract.
    constructor(address admin, IERC20 token) {
        if (admin == address(0)) revert ZeroAddress();
        if (address(token) == address(0)) revert ZeroAddress();

        treasuryToken = token;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(TREASURY_ROLE, admin);
        _grantRole(COMPLIANCE_ROLE, admin);
        _grantRole(APPROVER_ROLE, admin);
    }

    // -------------------------------------------------------------------------
    // External Functions
    // -------------------------------------------------------------------------

    /// @notice Creates a new payment request in `Pending` status.
    /// @dev Requires `TREASURY_ROLE`. Does not transfer tokens until execution.
    /// @param recipient Destination address for the payment.
    /// @param amount Token amount to pay.
    /// @param description Purpose or memo for the payment.
    /// @return id The newly created request identifier.
    function createPaymentRequest(address recipient, uint256 amount, string calldata description)
        external
        onlyRole(TREASURY_ROLE)
        returns (uint256 id)
    {
        if (recipient == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (bytes(description).length == 0) revert EmptyDescription();

        id = ++_nextRequestId;

        _requests[id] = PaymentRequest({
            id: id,
            recipient: recipient,
            amount: amount,
            description: description,
            status: PaymentStatus.Pending,
            createdAt: uint64(block.timestamp),
            executedAt: 0
        });

        _requestIds.push(id);

        emit PaymentRequested(id, recipient, amount, msg.sender);
    }

    /// @notice Records compliance approval for a pending payment request.
    /// @dev Requires `COMPLIANCE_ROLE`. Transitions `Pending` → `ComplianceApproved`.
    /// @param id Request identifier to validate.
    function validateCompliance(uint256 id) external onlyRole(COMPLIANCE_ROLE) {
        PaymentRequest storage request = _getRequest(id);
        _requireStatus(request, PaymentStatus.Pending);

        request.status = PaymentStatus.ComplianceApproved;

        emit ComplianceValidated(id, msg.sender, true);
    }

    /// @notice Grants human approval for a compliance-validated request.
    /// @dev Requires `APPROVER_ROLE`. Transitions `ComplianceApproved` → `Approved`.
    /// @param id Request identifier to approve.
    function approveRequest(uint256 id) external onlyRole(APPROVER_ROLE) {
        PaymentRequest storage request = _getRequest(id);
        _requireStatus(request, PaymentStatus.ComplianceApproved);

        request.status = PaymentStatus.Approved;

        emit ApprovalGranted(id, msg.sender);
    }

    /// @notice Executes an approved payment by transferring tokens to the recipient.
    /// @dev Requires `TREASURY_ROLE`. Protected against reentrancy.
    ///      Transitions `Approved` → `Executed`.
    /// @param id Request identifier to execute.
    function executePayment(uint256 id) external onlyRole(TREASURY_ROLE) nonReentrant {
        PaymentRequest storage request = _getRequest(id);
        _requireStatus(request, PaymentStatus.Approved);

        uint256 amount = request.amount;
        address recipient = request.recipient;

        uint256 balance = treasuryToken.balanceOf(address(this));
        if (balance < amount) revert InsufficientTreasuryBalance(balance, amount);

        request.status = PaymentStatus.Executed;
        request.executedAt = uint64(block.timestamp);

        treasuryToken.safeTransfer(recipient, amount);

        emit PaymentExecuted(id, recipient, amount, msg.sender);
    }

    /// @notice Rejects a payment request before it is executed.
    /// @dev Callable by `COMPLIANCE_ROLE` on `Pending` requests or `APPROVER_ROLE`
    ///      on `ComplianceApproved` requests. Transitions to `Rejected`.
    /// @param id Request identifier to reject.
    function rejectRequest(uint256 id) external {
        PaymentRequest storage request = _getRequest(id);

        PaymentStatus current = request.status;
        if (current == PaymentStatus.Executed || current == PaymentStatus.Rejected) {
            revert AlreadyTerminal(current);
        }

        if (current == PaymentStatus.Pending) {
            _checkRole(COMPLIANCE_ROLE, msg.sender);
        } else if (current == PaymentStatus.ComplianceApproved) {
            _checkRole(APPROVER_ROLE, msg.sender);
        } else {
            revert InvalidStatus(current, PaymentStatus.Pending);
        }

        request.status = PaymentStatus.Rejected;

        emit PaymentRejected(id, msg.sender, current);
    }

    // -------------------------------------------------------------------------
    // View Functions
    // -------------------------------------------------------------------------

    /// @notice Returns a single payment request by ID.
    /// @param id Request identifier.
    /// @return request The full payment request struct.
    function getRequest(uint256 id) external view returns (PaymentRequest memory request) {
        return _getRequest(id);
    }

    /// @notice Returns all payment requests ever created.
    /// @dev Gas cost scales linearly with the number of requests. For production
    ///      deployments with large histories, prefer off-chain event indexing.
    /// @return requests Array of all payment requests in creation order.
    function getAllRequests() external view returns (PaymentRequest[] memory requests) {
        uint256 length = _requestIds.length;
        requests = new PaymentRequest[](length);

        for (uint256 i = 0; i < length;) {
            requests[i] = _requests[_requestIds[i]];
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Returns the total number of payment requests created.
    /// @return count Total request count.
    function getRequestCount() external view returns (uint256 count) {
        return _requestIds.length;
    }

    /// @notice Returns the current treasury token balance held by this contract.
    /// @return balance Token balance available for outbound payments.
    function treasuryBalance() external view returns (uint256 balance) {
        return treasuryToken.balanceOf(address(this));
    }

    /// @notice Returns the next request ID that will be assigned.
    /// @return nextId Next request identifier.
    function nextRequestId() external view returns (uint256 nextId) {
        return _nextRequestId + 1;
    }

    // -------------------------------------------------------------------------
    // Internal Functions
    // -------------------------------------------------------------------------

    /// @dev Loads a request or reverts if the ID has never been assigned.
    function _getRequest(uint256 id) internal view returns (PaymentRequest storage request) {
        if (id == 0 || id > _nextRequestId) revert InvalidRequestId();
        request = _requests[id];
        if (request.createdAt == 0) revert InvalidRequestId();
    }

    /// @dev Reverts unless the request is in the expected status.
    function _requireStatus(PaymentRequest storage request, PaymentStatus required) internal view {
        if (request.status != required) {
            revert InvalidStatus(request.status, required);
        }
    }
}
