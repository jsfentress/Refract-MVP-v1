// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Vault {
    mapping(address => uint256) public balances;

    event DepositMade(address indexed sender, address indexed recipient, uint256 amount);

    function deposit(address recipient) external payable {
        require(msg.value > 0, "No ETH sent");
        require(recipient != address(0), "Invalid recipient");

        balances[recipient] += msg.value;

        emit DepositMade(msg.sender, recipient, msg.value);
    }
}
