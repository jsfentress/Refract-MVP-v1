// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockVault {
    uint256 private _amount;
    uint256 private _scheduleId;
    address private _depositor;

    constructor(uint256 depositAmount, uint256 scheduleId, address depositor) {
        _amount = depositAmount;
        _scheduleId = scheduleId;
        _depositor = depositor;
    }

    function getClaimData(uint256 /* tokenId */) external view returns (
        uint256 amount,
        uint256 schedule,
        address depositorAddr
    ) {
        return (_amount, _scheduleId, _depositor);
    }
}
