// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ClaimToken.sol";
import "./ClaimScheduleManager.sol";

contract Vault {
    mapping(address => uint256) public balances;
    mapping(uint256 => uint256) public claimedAmounts;

    ClaimToken public claimToken;
    ClaimScheduleManager public scheduleManager;

    event DepositMade(address indexed sender, address indexed recipient, uint256 amount);
    event ClaimTokenIssued(address indexed recipient, uint256 indexed tokenId, string tokenURI);

    constructor(address claimTokenAddress, address scheduleManagerAddress) {
        claimToken = ClaimToken(claimTokenAddress);
        scheduleManager = ClaimScheduleManager(scheduleManagerAddress);
    }

    function deposit(address recipient, string memory tokenURI) external payable {
        require(msg.value > 0, "No ETH sent");
        require(recipient != address(0), "Invalid recipient");

        balances[recipient] += msg.value;
        emit DepositMade(msg.sender, recipient, msg.value);

        uint256 tokenId = claimToken.mint(recipient, tokenURI);
        emit ClaimTokenIssued(recipient, tokenId, tokenURI);
    }

    function claim(uint256 tokenId) external {
        require(claimToken.ownerOf(tokenId) == msg.sender, "Not token owner");

        uint256 totalBalance = balances[msg.sender];
        require(totalBalance > 0, "No balance to claim");

        uint256 unlockedPercent = scheduleManager.getUnlockedPercent(tokenId, block.timestamp);
        uint256 totalUnlocked = (totalBalance * unlockedPercent) / 100;
        uint256 alreadyClaimed = claimedAmounts[tokenId];
        require(totalUnlocked > alreadyClaimed, "Nothing new to claim");

        uint256 claimable = totalUnlocked - alreadyClaimed;
        claimedAmounts[tokenId] = totalUnlocked;

        (bool success, ) = msg.sender.call{value: claimable}("");
        require(success, "ETH transfer failed");
    }
}
