// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ClaimScheduleManager.sol";
import "./ClaimToken.sol";

contract ScheduleUpdater {
    ClaimScheduleManager public scheduleManager;
    ClaimToken public claimToken;

    constructor(address _scheduleManager, address _claimToken) {
        scheduleManager = ClaimScheduleManager(_scheduleManager);
        claimToken = ClaimToken(_claimToken);
    }

    function updateSchedule(
        uint256 tokenId,
        uint256[] calldata newTimestamps,
        uint256[] calldata newPercents
    ) external {
        require(claimToken.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(newTimestamps.length == newPercents.length, "Length mismatch");

        uint256 total = 0;
        for (uint256 i = 0; i < newPercents.length; i++) {
            total += newPercents[i];
        }
        require(total == 100, "Unlock % must total 100");

        scheduleManager.setSchedule(tokenId, newTimestamps, newPercents);
    }
}
