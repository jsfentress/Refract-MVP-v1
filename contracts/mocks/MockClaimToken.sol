// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockClaimToken {
    uint256 private _tokenId;
    address private _owner;

    constructor(uint256 tokenId, address owner_) {
        _tokenId = tokenId;
        _owner = owner_;
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        require(tokenId == _tokenId, "Invalid tokenId");
        return _owner;
    }

    function mint(address to) external returns (uint256) {
        _owner = to;
        return _tokenId;
    }
}
