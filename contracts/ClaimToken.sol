// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ClaimToken is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    event ClaimTokenIssued(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor(address initialOwner) ERC721("Refract Claim Token", "RCT") Ownable(initialOwner) {}

    function mint(address to, string memory uri) external onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        emit ClaimTokenIssued(to, tokenId, uri);
        return tokenId;
    }
}
