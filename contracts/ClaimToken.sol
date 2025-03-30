// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ClaimToken is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    string public baseURI;

    event ClaimTokenIssued(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor(address vaultAddress) ERC721("Refract Claim Token", "RCT") {
        baseURI = "http://localhost:3001/api/claim/";
        _transferOwnership(vaultAddress); // Only Vault can call `mint`
    }

    function mint(address to) external onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _mint(to, tokenId);
        emit ClaimTokenIssued(to, tokenId, tokenURI(tokenId));
        return tokenId;
    }

    function setBaseURI(string memory newURI) external onlyOwner {
        baseURI = newURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(baseURI, Strings.toString(tokenId)));
    }
}
