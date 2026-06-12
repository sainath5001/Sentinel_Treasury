// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {TreasuryToken} from "../src/TreasuryToken.sol";

contract TreasuryTokenTest is Test {
    TreasuryToken internal token;

    address internal owner = makeAddr("owner");
    address internal treasury = makeAddr("treasury");
    address internal recipient = makeAddr("recipient");

    uint256 internal constant INITIAL_SUPPLY = 1_000_000 ether;

    function setUp() public {
        token = new TreasuryToken(owner, treasury, INITIAL_SUPPLY);
    }

    function test_InitialState() public view {
        assertEq(token.name(), "Sentinel Treasury Token");
        assertEq(token.symbol(), "STT");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
        assertEq(token.balanceOf(treasury), INITIAL_SUPPLY);
        assertEq(token.owner(), owner);
    }

    function test_MintByOwner() public {
        uint256 amount = 500 ether;

        vm.prank(owner);
        token.mint(recipient, amount);

        assertEq(token.balanceOf(recipient), amount);
        assertEq(token.totalSupply(), INITIAL_SUPPLY + amount);
    }

    function test_RevertMintByNonOwner() public {
        vm.prank(recipient);
        vm.expectRevert();
        token.mint(recipient, 1 ether);
    }

    function test_RevertMintToZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(TreasuryToken.ZeroAddress.selector);
        token.mint(address(0), 1 ether);
    }

    function test_RevertMintZeroAmount() public {
        vm.prank(owner);
        vm.expectRevert(TreasuryToken.ZeroAmount.selector);
        token.mint(recipient, 0);
    }

    function test_RevertDeployWithZeroTreasury() public {
        vm.expectRevert(TreasuryToken.ZeroAddress.selector);
        new TreasuryToken(owner, address(0), INITIAL_SUPPLY);
    }

    function test_RevertDeployWithZeroInitialSupply() public {
        vm.expectRevert(TreasuryToken.ZeroAmount.selector);
        new TreasuryToken(owner, treasury, 0);
    }
}
