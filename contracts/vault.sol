// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ClaimToken.sol";

contract Vault {
    mapping(address => uint256) public balances;
    ClaimToken public claimToken;

    event DepositMade(address indexed sender, address indexed recipient, uint256 amount);
    event ClaimTokenIssued(address indexed recipient, uint256 indexed tokenId, string tokenURI);

    constructor(address claimTokenAddress) {
        claimToken = ClaimToken(claimTokenAddress);
    }

    function deposit(address recipient, string memory tokenURI) external payable {
        require(msg.value > 0, "No ETH sent");
        require(recipient != address(0), "Invalid recipient");

        balances[recipient] += msg.value;
        emit DepositMade(msg.sender, recipient, msg.value);

        uint256 tokenId = claimToken.mint(recipient, tokenURI);
        emit ClaimTokenIssued(recipient, tokenId, tokenURI);
    }
}
