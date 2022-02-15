pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

// CursedWordV3Coins - public interface for the "Guess the 5 letter word" Blockchain Game
// Mints "Cursed Word Coin" rewards for winning

// Logging in CursedWord
import "hardhat/console.sol";

// CursedWordCoin - generated via openzeppelin wizard
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CursedWordV3 {
  bool public gameIsActive;
  uint public id;
  uint public numberOfGuesses;
  address public contractOwner;
  CursedWordCoin cursedWordCoin;

  event GuessReceived(uint indexed id, uint guessNumber, address guesser, bytes wordGuessed);
  event GuessResult(uint indexed id,  uint guessNumber, address guesser, bytes wordGuessed, uint16 result);

  constructor() {
    id = 1;
    numberOfGuesses = 0;
    gameIsActive = true;

    // Word Oracle that stores the secret word and response to guesses.
    // TODO: THIS IS A COMPROMISED ACCOUNT
    contractOwner = 0xcbc4efe8CCf05a9435089e2F8F68622abBb7642e;

    console.log("Time to create a new cryptocurrency");

    // Create our own cryptocurrency! This contract will become its owner.
    cursedWordCoin = new CursedWordCoin();

    console.log("Address of new contract: ", address(cursedWordCoin));

    console.log("Created a new cryptocurrency");
  }

  function attempt(uint wordId, bytes memory guess) payable public {
    require(gameIsActive == true, "Game is not active");
    require(id == wordId, "This word has already been solved.");
    // TODO require minimum eth send for play. Base on gas cost?

    // idk 1 coin for guessing?
    cursedWordCoin.mint(msg.sender, 1);

    numberOfGuesses += 1;
    console.log("Number of Guesses: ", numberOfGuesses);
    emit GuessReceived(id, numberOfGuesses, msg.sender, guess);
  }

  function resetGame() private {
    id += 1;
    numberOfGuesses = 0;
  }

  function toggleGame() public {
    require(msg.sender == contractOwner, "Unauthorized");
    gameIsActive = !gameIsActive;
  }

  function respond_to_guess(uint wordId, uint guessNumber, address payable guesser, bytes memory wordGuessed, uint16 response) public payable {
    require(msg.sender == contractOwner, "Unauthorized");
    console.log("Response received: ", response, msg.sender);

    if (response == 33333) {
      // Send the Oracle the remaining ~20% of the collected funds
      (bool sentToOwner, bytes memory _ownserSendData) = contractOwner.call{value: (address(this).balance / 5)}("");
      require(sentToOwner, "Failed to send winner Ether");

      // Send the winner remaining ~80% of the received funds
      (bool sentToWinner, bytes memory _winnerSendData) = guesser.call{value: address(this).balance }("");
      require(sentToWinner, "Failed to send winner Ether");

      console.log("The correct word was guessed!");

      // Mint 100_000 Cursed Word Coins to the winner
      console.log("Minting for winning :toot:");
      cursedWordCoin.mint(guesser, 100000);

      resetGame();
    }

    emit GuessResult(wordId, guessNumber, guesser, wordGuessed, response);
  }
}

contract CursedWordCoin is ERC20, Pausable, Ownable {
    constructor() ERC20("Cursed Word Coin", "CWC") {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        console.log("===CWC=== Minting: ", amount);
        console.log("===CWC=== Coins for: ", to);
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
