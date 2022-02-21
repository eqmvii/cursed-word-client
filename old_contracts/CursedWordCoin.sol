pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

// Cursed Word Coin: Mints reward tokens for playing Cursed Word Game

// Generated via openzeppelin wizard

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CWCoin is ERC20, Pausable, Ownable {
    constructor() ERC20("CursedWordCoin", "CWC") {
        transferOwnership(0xcbc4efe8CCf05a9435089e2F8F68622abBb7642e);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}
