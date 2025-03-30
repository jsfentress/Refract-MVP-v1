// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IClaimScheduleManager {
    function getUnlockPercentage(uint256 scheduleId, uint256 timestamp) external view returns (uint256);
}

interface IVault {
    function getClaimData(uint256 tokenId) external view returns (
        uint256 depositAmount,
        uint256 scheduleId,
        address depositor
    );
}

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract ClaimRedemption is ReentrancyGuard, Ownable {
    IClaimScheduleManager public scheduleManager;
    IVault public vault;
    IERC721 public claimToken;

    mapping(uint256 => uint256) public claimedAmount;

    event Claimed(uint256 indexed tokenId, uint256 amount, address indexed receiver);

    constructor(address _scheduleManager, address _vault, address _claimToken) {
        scheduleManager = IClaimScheduleManager(_scheduleManager);
        vault = IVault(_vault);
        claimToken = IERC721(_claimToken);
    }

    function redeem(uint256 tokenId) external nonReentrant {
        require(msg.sender == claimToken.ownerOf(tokenId), "Not token owner");

        (uint256 depositAmount, uint256 scheduleId, ) = vault.getClaimData(tokenId);
        uint256 unlockPercentage = scheduleManager.getUnlockPercentage(scheduleId, block.timestamp);
        require(unlockPercentage > 0, "Nothing unlocked yet");

        uint256 totalUnlocked = (depositAmount * unlockPercentage) / 100;
        uint256 alreadyClaimed = claimedAmount[tokenId];
        require(totalUnlocked > alreadyClaimed, "Already fully claimed");

        uint256 claimable = totalUnlocked - alreadyClaimed;
        claimedAmount[tokenId] = totalUnlocked;

        (bool success, ) = msg.sender.call{value: claimable}("");
        require(success, "ETH transfer failed");

        emit Claimed(tokenId, claimable, msg.sender);
    }

    function getClaimable(uint256 tokenId) external view returns (uint256) {
        (uint256 depositAmount, uint256 scheduleId, ) = vault.getClaimData(tokenId);
        uint256 unlockPercentage = scheduleManager.getUnlockPercentage(scheduleId, block.timestamp);
        uint256 totalUnlocked = (depositAmount * unlockPercentage) / 100;
        return totalUnlocked - claimedAmount[tokenId];
    }

    // Allow the contract to receive ETH from Vault
    receive() external payable {}
}
