// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ClaimScheduleManager {
    struct ClaimSchedule {
        uint256[] unlockTimestamps;
        uint256[] unlockPercents; // Must add up to 100
    }

    mapping(uint256 => ClaimSchedule) public schedules;

    function setSchedule(
        uint256 tokenId,
        uint256[] calldata timestamps,
        uint256[] calldata percents
    ) external {
        require(timestamps.length == percents.length, "Length mismatch");

        uint256 total;
        for (uint256 i = 0; i < percents.length; i++) {
            total += percents[i];
        }
        require(total == 100, "Total unlock percent must equal 100");

        schedules[tokenId] = ClaimSchedule(timestamps, percents);
    }

    function getUnlockedPercent(uint256 tokenId, uint256 currentTime) external view returns (uint256) {
        ClaimSchedule storage schedule = schedules[tokenId];
        uint256 unlocked = 0;

        for (uint256 i = 0; i < schedule.unlockTimestamps.length; i++) {
            if (currentTime >= schedule.unlockTimestamps[i]) {
                unlocked += schedule.unlockPercents[i];
            }
        }

        return unlocked;
    }
}
