pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

// CursedWordV2Multiple - public interface for the "Guess the 5 letter word" Blockchain Game

import "hardhat/console.sol";

contract CursedWordV2 {
  bool public gameIsActive;
  uint public id;
  uint public numberOfGuesses;
  address public contractOwner;

  event GuessReceived(uint indexed id, uint guessNumber, address guesser, bytes wordGuessed);
  event GuessResult(uint indexed id,  uint guessNumber, address guesser, bytes wordGuessed, uint16 result);

  constructor() {
    id = 1;
    numberOfGuesses = 0;
    gameIsActive = true;

    // Word Oracle that stores the secret word and response to guesses.
    contractOwner = 0xcbc4efe8CCf05a9435089e2F8F68622abBb7642e;
  }

  function attempt(uint wordId, bytes memory guess) payable public {
    require(gameIsActive == true, "Game is not active");
    require(id == wordId, "This word has already been solved.");
    // TODO require minimum eth send for play. Base on gas cost?

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
      resetGame();
    }

    emit GuessResult(wordId, guessNumber, guesser, wordGuessed, response);
  }
}
