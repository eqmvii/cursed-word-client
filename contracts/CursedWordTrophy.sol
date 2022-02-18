pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

// Cursed Word Trophy: Mints "Cursed Word Coin" rewards for winning Cursed Word Game

// Generated via openzeppelin wizard

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CWTrophy is ERC721, Ownable {
    constructor() ERC721("CursedWordTrophy", "CWT") {
        transferOwnership(0xcbc4efe8CCf05a9435089e2F8F68622abBb7642e);
    }

    // No URI because id is enough. Game logs store word & guess history for the trophy.
    // Vue app can generate a nice picture by fetching the logs once it knows which word it was.
    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
}
