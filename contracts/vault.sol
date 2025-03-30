// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ClaimToken.sol";
import "./ClaimScheduleManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Vault is Ownable {
    ClaimToken public claimToken;
    ClaimScheduleManager public scheduleManager;

    // Maps each tokenId to its deposit metadata
    mapping(uint256 => uint256) public depositedAmount;
    mapping(uint256 => address) public depositor;
    mapping(uint256 => uint256) public claimedAmounts;
    mapping(uint256 => uint256) public scheduleId; // Optional, in case of multiple schedules

    event DepositMade(address indexed sender, address indexed recipient, uint256 amount);
    event ClaimTokenIssued(address indexed recipient, uint256 indexed tokenId, string tokenURI);

    constructor(address claimTokenAddress, address scheduleManagerAddress) {
        claimToken = ClaimToken(claimTokenAddress);
        scheduleManager = ClaimScheduleManager(scheduleManagerAddress);
    }

    function deposit(address recipient, string memory tokenURI) external payable {
        require(msg.value > 0, "No ETH sent");
        require(recipient != address(0), "Invalid recipient");

        uint256 tokenId = claimToken.mint(recipient);

        depositedAmount[tokenId] = msg.value;
        scheduleId[tokenId] = 0; // Default for now — support multiple later
        depositor[tokenId] = msg.sender;

        emit DepositMade(msg.sender, recipient, msg.value);
        emit ClaimTokenIssued(recipient, tokenId, tokenURI);
    }

    function claim(uint256 tokenId) external {
        require(claimToken.ownerOf(tokenId) == msg.sender, "Not token owner");

        uint256 amount = depositedAmount[tokenId];
        require(amount > 0, "No balance for this token");

        uint256 unlockedPercent = scheduleManager.getUnlockedPercent(scheduleId[tokenId], block.timestamp);
        uint256 totalUnlocked = (amount * unlockedPercent) / 100;
        uint256 alreadyClaimed = claimedAmounts[tokenId];
        require(totalUnlocked > alreadyClaimed, "Nothing new to claim");

        uint256 claimable = totalUnlocked - alreadyClaimed;
        claimedAmounts[tokenId] = totalUnlocked;

        (bool success, ) = msg.sender.call{value: claimable}("");
        require(success, "ETH transfer failed");
    }

    // View function for ClaimRedemption integration
    function getClaimData(uint256 tokenId) external view returns (
        uint256 amount,
        uint256 schedule,
        address depositorAddr
    ) {
        return (
            depositedAmount[tokenId],
            scheduleId[tokenId],
            depositor[tokenId]
        );
    }

    function setScheduleId(uint256 tokenId, uint256 newScheduleId) external onlyOwner {
    scheduleId[tokenId] = newScheduleId;
}

    // Allow receiving ETH (if needed from other contracts)
    receive() external payable {}
}
