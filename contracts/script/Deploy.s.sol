// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {TreasuryToken} from "../src/TreasuryToken.sol";
import {TreasuryManager} from "../src/TreasuryManager.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title DeploySentinelTreasury
/// @notice Foundry deployment script for Sentinel Treasury on Sepolia (or any EVM chain).
/// @dev Required env vars:
///      - PRIVATE_KEY: deployer private key
///      - ADMIN_ADDRESS (optional): admin/roles recipient; defaults to deployer
///      - INITIAL_SUPPLY (optional): token units with 18 decimals; defaults to 1_000_000e18
contract DeploySentinelTreasury is Script {
    uint256 internal constant DEFAULT_INITIAL_SUPPLY = 1_000_000 ether;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        address admin = vm.envOr("ADMIN_ADDRESS", deployer);
        uint256 initialSupply = vm.envOr("INITIAL_SUPPLY", DEFAULT_INITIAL_SUPPLY);

        vm.startBroadcast(deployerKey);

        // 1. Mint initial supply to deployer temporarily.
        TreasuryToken token = new TreasuryToken(deployer, deployer, initialSupply);

        // 2. Deploy manager wired to the treasury token.
        TreasuryManager manager = new TreasuryManager(admin, IERC20(address(token)));

        // 3. Fund the manager vault with the full initial supply.
        bool transferred = token.transfer(address(manager), initialSupply);
        require(transferred, "Treasury funding failed");

        vm.stopBroadcast();

        console2.log("=== Sentinel Treasury Deployment ===");
        console2.log("Deployer:", deployer);
        console2.log("Admin:", admin);
        console2.log("TreasuryToken:", address(token));
        console2.log("TreasuryManager:", address(manager));
        console2.log("Initial supply:", initialSupply);
        console2.log("Manager balance:", token.balanceOf(address(manager)));
    }
}
