// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockScheduleManager {
    mapping(uint256 => uint256) public unlockPercentages;

    function setUnlockPercentage(uint256 scheduleId, uint256 percentage) external {
        unlockPercentages[scheduleId] = percentage;
    }

    function getUnlockPercentage(uint256 scheduleId, uint256 /* timestamp */) external view returns (uint256) {
        return unlockPercentages[scheduleId];
    }
}
