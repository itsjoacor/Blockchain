// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ERC1155NFT is ERC1155, Ownable {
    uint256 public constant TOKEN_ID = 1;

    constructor(string memory baseURI) ERC1155(baseURI) {
        _mint(msg.sender, TOKEN_ID, 1, "");
    }

    function uri(uint256 _tokenId) override public view returns (string memory) {
        return string(
            abi.encodePacked(
                super.uri(_tokenId)
            )
        );
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, TOKEN_ID, amount, "");
    }

    function mintBatch(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Recipients and amounts length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], TOKEN_ID, amounts[i], "");
        }
    }
}
