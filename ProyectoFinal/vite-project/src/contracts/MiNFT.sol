// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MiNFT is ERC1155, Ownable {
    uint256 public currentTokenID = 0;
    mapping(uint256 => string) private _uris;

    constructor() ERC1155("") {}

    function mint(address to, uint256 amount, string memory uri) public onlyOwner returns (uint256) {
        uint256 tokenId = currentTokenID;
        currentTokenID += 1;
        _mint(to, tokenId, amount, "");
        _uris[tokenId] = uri;
        return tokenId;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return _uris[tokenId];
    }
}
