// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ClaimToken is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    event ClaimTokenIssued(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("ClaimToken", "CLM") {}

    function mint(address to, string memory tokenURI) external onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit ClaimTokenIssued(to, tokenId, tokenURI);
        return tokenId;
    }
}
