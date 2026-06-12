// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {TreasuryToken} from "../src/TreasuryToken.sol";
import {TreasuryManager} from "../src/TreasuryManager.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TreasuryManagerTest is Test {
    TreasuryToken internal token;
    TreasuryManager internal manager;

    address internal admin = makeAddr("admin");
    address internal treasuryAgent = makeAddr("treasuryAgent");
    address internal complianceAgent = makeAddr("complianceAgent");
    address internal approver = makeAddr("approver");
    address internal recipient = makeAddr("recipient");
    address internal outsider = makeAddr("outsider");

    uint256 internal constant INITIAL_SUPPLY = 1_000_000 ether;
    uint256 internal constant PAYMENT_AMOUNT = 10_000 ether;

    bytes32 internal constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    bytes32 internal constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 internal constant APPROVER_ROLE = keccak256("APPROVER_ROLE");

    function setUp() public {
        token = new TreasuryToken(admin, admin, INITIAL_SUPPLY);
        manager = new TreasuryManager(admin, IERC20(address(token)));

        vm.startPrank(admin);
        token.transfer(address(manager), INITIAL_SUPPLY);
        manager.grantRole(TREASURY_ROLE, treasuryAgent);
        manager.grantRole(COMPLIANCE_ROLE, complianceAgent);
        manager.grantRole(APPROVER_ROLE, approver);
        vm.stopPrank();
    }

    function test_InitialRolesAndBalance() public view {
        assertTrue(manager.hasRole(manager.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(manager.hasRole(TREASURY_ROLE, admin));
        assertEq(manager.treasuryBalance(), INITIAL_SUPPLY);
        assertEq(manager.getRequestCount(), 0);
        assertEq(manager.nextRequestId(), 1);
    }

    function test_FullPaymentLifecycle() public {
        uint256 id = _createRequest();

        assertEq(uint256(_status(id)), uint256(TreasuryManager.PaymentStatus.Pending));

        vm.prank(complianceAgent);
        manager.validateCompliance(id);
        assertEq(uint256(_status(id)), uint256(TreasuryManager.PaymentStatus.ComplianceApproved));

        vm.prank(approver);
        manager.approveRequest(id);
        assertEq(uint256(_status(id)), uint256(TreasuryManager.PaymentStatus.Approved));

        vm.prank(treasuryAgent);
        manager.executePayment(id);

        TreasuryManager.PaymentRequest memory request = manager.getRequest(id);
        assertEq(uint256(request.status), uint256(TreasuryManager.PaymentStatus.Executed));
        assertGt(request.executedAt, 0);
        assertEq(token.balanceOf(recipient), PAYMENT_AMOUNT);
        assertEq(manager.treasuryBalance(), INITIAL_SUPPLY - PAYMENT_AMOUNT);
    }

    function test_GetAllRequests() public {
        vm.startPrank(treasuryAgent);
        manager.createPaymentRequest(recipient, 100 ether, "Payment A");
        manager.createPaymentRequest(recipient, 200 ether, "Payment B");
        vm.stopPrank();

        TreasuryManager.PaymentRequest[] memory requests = manager.getAllRequests();
        assertEq(requests.length, 2);
        assertEq(requests[0].id, 1);
        assertEq(requests[1].id, 2);
        assertEq(requests[1].amount, 200 ether);
    }

    function test_RejectFromPendingByCompliance() public {
        uint256 id = _createRequest();

        vm.prank(complianceAgent);
        manager.rejectRequest(id);

        assertEq(uint256(_status(id)), uint256(TreasuryManager.PaymentStatus.Rejected));
    }

    function test_RejectFromComplianceApprovedByApprover() public {
        uint256 id = _createRequest();

        vm.prank(complianceAgent);
        manager.validateCompliance(id);

        vm.prank(approver);
        manager.rejectRequest(id);

        assertEq(uint256(_status(id)), uint256(TreasuryManager.PaymentStatus.Rejected));
    }

    function test_RevertCreateWithZeroRecipient() public {
        vm.prank(treasuryAgent);
        vm.expectRevert(TreasuryManager.ZeroAddress.selector);
        manager.createPaymentRequest(address(0), PAYMENT_AMOUNT, "Invalid");
    }

    function test_RevertCreateWithZeroAmount() public {
        vm.prank(treasuryAgent);
        vm.expectRevert(TreasuryManager.ZeroAmount.selector);
        manager.createPaymentRequest(recipient, 0, "Invalid");
    }

    function test_RevertCreateWithEmptyDescription() public {
        vm.prank(treasuryAgent);
        vm.expectRevert(TreasuryManager.EmptyDescription.selector);
        manager.createPaymentRequest(recipient, PAYMENT_AMOUNT, "");
    }

    function test_RevertValidateComplianceWrongRole() public {
        uint256 id = _createRequest();

        vm.prank(outsider);
        vm.expectRevert();
        manager.validateCompliance(id);
    }

    function test_RevertValidateComplianceWrongStatus() public {
        uint256 id = _createRequest();

        vm.startPrank(complianceAgent);
        manager.validateCompliance(id);
        vm.expectRevert(
            abi.encodeWithSelector(
                TreasuryManager.InvalidStatus.selector,
                TreasuryManager.PaymentStatus.ComplianceApproved,
                TreasuryManager.PaymentStatus.Pending
            )
        );
        manager.validateCompliance(id);
        vm.stopPrank();
    }

    function test_RevertApproveBeforeCompliance() public {
        uint256 id = _createRequest();

        vm.prank(approver);
        vm.expectRevert(
            abi.encodeWithSelector(
                TreasuryManager.InvalidStatus.selector,
                TreasuryManager.PaymentStatus.Pending,
                TreasuryManager.PaymentStatus.ComplianceApproved
            )
        );
        manager.approveRequest(id);
    }

    function test_RevertExecuteBeforeApproval() public {
        uint256 id = _createRequest();

        vm.prank(complianceAgent);
        manager.validateCompliance(id);

        vm.prank(treasuryAgent);
        vm.expectRevert(
            abi.encodeWithSelector(
                TreasuryManager.InvalidStatus.selector,
                TreasuryManager.PaymentStatus.ComplianceApproved,
                TreasuryManager.PaymentStatus.Approved
            )
        );
        manager.executePayment(id);
    }

    function test_RevertExecuteInsufficientBalance() public {
        // Request more tokens than the vault holds.
        vm.prank(treasuryAgent);
        uint256 id = manager.createPaymentRequest(recipient, INITIAL_SUPPLY + 1, "Overdraft");

        vm.prank(complianceAgent);
        manager.validateCompliance(id);

        vm.prank(approver);
        manager.approveRequest(id);

        vm.prank(treasuryAgent);
        vm.expectRevert(
            abi.encodeWithSelector(
                TreasuryManager.InsufficientTreasuryBalance.selector, INITIAL_SUPPLY, INITIAL_SUPPLY + 1
            )
        );
        manager.executePayment(id);
    }

    function test_RevertGetInvalidRequestId() public {
        vm.expectRevert(TreasuryManager.InvalidRequestId.selector);
        manager.getRequest(0);

        vm.expectRevert(TreasuryManager.InvalidRequestId.selector);
        manager.getRequest(999);
    }

    function test_RevertRejectExecutedRequest() public {
        uint256 id = _createRequest();

        vm.prank(complianceAgent);
        manager.validateCompliance(id);

        vm.prank(approver);
        manager.approveRequest(id);

        vm.prank(treasuryAgent);
        manager.executePayment(id);

        vm.prank(approver);
        vm.expectRevert(
            abi.encodeWithSelector(TreasuryManager.AlreadyTerminal.selector, TreasuryManager.PaymentStatus.Executed)
        );
        manager.rejectRequest(id);
    }

    function test_EventsEmittedOnLifecycle() public {
        vm.prank(treasuryAgent);
        vm.expectEmit(true, true, true, true);
        emit TreasuryManager.PaymentRequested(1, recipient, PAYMENT_AMOUNT, treasuryAgent);
        manager.createPaymentRequest(recipient, PAYMENT_AMOUNT, "Invoice #1042");

        vm.prank(complianceAgent);
        vm.expectEmit(true, true, false, true);
        emit TreasuryManager.ComplianceValidated(1, complianceAgent, true);
        manager.validateCompliance(1);

        vm.prank(approver);
        vm.expectEmit(true, true, false, false);
        emit TreasuryManager.ApprovalGranted(1, approver);
        manager.approveRequest(1);

        vm.prank(treasuryAgent);
        vm.expectEmit(true, true, false, true);
        emit TreasuryManager.PaymentExecuted(1, recipient, PAYMENT_AMOUNT, treasuryAgent);
        manager.executePayment(1);
    }

    function _createRequest() internal returns (uint256 id) {
        vm.prank(treasuryAgent);
        id = manager.createPaymentRequest(recipient, PAYMENT_AMOUNT, "Invoice #1042");
    }

    function _status(uint256 id) internal view returns (TreasuryManager.PaymentStatus) {
        return manager.getRequest(id).status;
    }
}

/// @dev Malicious token that attempts reentrancy during transfer.
contract ReentrantToken is TreasuryToken {
    TreasuryManager public target;
    uint256 public attackId;

    constructor(address owner_, address target_) TreasuryToken(owner_, owner_, 1_000_000 ether) {
        target = TreasuryManager(target_);
    }

    function setTarget(TreasuryManager target_) external {
        target = target_;
    }

    function setAttackId(uint256 id) external {
        attackId = id;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        if (address(target) != address(0) && attackId != 0 && to != address(target)) {
            target.executePayment(attackId);
        }
        return super.transfer(to, amount);
    }
}

contract TreasuryManagerReentrancyTest is Test {
    function test_ReentrancyGuardBlocksExecute() public {
        address admin = makeAddr("admin");
        address treasuryAgent = makeAddr("treasuryAgent");
        address complianceAgent = makeAddr("complianceAgent");
        address approver = makeAddr("approver");
        address recipient = makeAddr("recipient");

        ReentrantToken token = new ReentrantToken(admin, address(0));
        TreasuryManager manager = new TreasuryManager(admin, IERC20(address(token)));
        token.setTarget(manager);

        vm.startPrank(admin);
        token.transfer(address(manager), 500_000 ether);
        manager.grantRole(manager.TREASURY_ROLE(), treasuryAgent);
        manager.grantRole(manager.COMPLIANCE_ROLE(), complianceAgent);
        manager.grantRole(manager.APPROVER_ROLE(), approver);
        vm.stopPrank();

        vm.prank(treasuryAgent);
        uint256 id = manager.createPaymentRequest(recipient, 10_000 ether, "Reentrancy probe");

        vm.prank(complianceAgent);
        manager.validateCompliance(id);

        vm.prank(approver);
        manager.approveRequest(id);

        token.setAttackId(id);

        vm.prank(treasuryAgent);
        vm.expectRevert();
        manager.executePayment(id);
    }
}
