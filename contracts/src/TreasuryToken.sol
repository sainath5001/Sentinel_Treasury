// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title TreasuryToken
/// @author Sentinel Treasury
/// @notice ERC-20 token used as the internal currency for Sentinel Treasury operations.
/// @dev Initial supply is minted to the designated treasury address at deployment.
///      Additional supply can be minted by the owner (typically a multisig or governance).
contract TreasuryToken is ERC20, Ownable {
    /// @notice Thrown when minting to the zero address.
    error ZeroAddress();

    /// @notice Thrown when mint amount is zero.
    error ZeroAmount();

    /// @notice Emitted when new tokens are minted.
    /// @param to Recipient of the minted tokens.
    /// @param amount Number of tokens minted.
    event TokensMinted(address indexed to, uint256 amount);

    /// @notice Deploys the token and mints the initial supply to the treasury vault.
    /// @param initialOwner Address that receives Ownable privileges (mint authority).
    /// @param treasury Address that receives the initial token supply.
    /// @param initialSupply Amount of tokens to mint at deployment (18 decimals).
    constructor(address initialOwner, address treasury, uint256 initialSupply)
        ERC20("Sentinel Treasury Token", "STT")
        Ownable(initialOwner)
    {
        if (treasury == address(0)) revert ZeroAddress();
        if (initialSupply == 0) revert ZeroAmount();

        _mint(treasury, initialSupply);
        emit TokensMinted(treasury, initialSupply);
    }

    /// @notice Mints additional tokens to a recipient.
    /// @dev Restricted to the contract owner.
    /// @param to Recipient of the newly minted tokens.
    /// @param amount Number of tokens to mint.
    function mint(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
}
