pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

// CursedWordV2Multiple - public interface for the "Guess the 5 letter word" Blockchain Game

import "hardhat/console.sol"; // TODO remove for prod

contract CursedWordV2 {
  bool public gameIsActive;
  uint public id;
  uint public numberOfGuesses;

  event GuessReceived(uint indexed id, uint guessNumber, address guesser, bytes wordGuessed);
  event GuessResult(uint indexed id,  uint guessNumber, address guesser, bytes wordGuessed, uint16 result);

  constructor() {
    id = 1;
    numberOfGuesses = 0;
    gameIsActive = true;
  }

  function attempt(uint wordId, bytes memory guess) payable public {
    require(gameIsActive == true, "Game is not active");
    require(id == wordId, "This word has already been solved.");
    // TODO require minimum eth send for play

    numberOfGuesses += 1;
    console.log("Number of Guesses: ", numberOfGuesses);
    emit GuessReceived(id, numberOfGuesses, msg.sender, guess);
  }

  function resetGame() private {
    id += 1;
    numberOfGuesses = 0;
  }

  // TODO restrict to owner
  function toggleGame() public {
    gameIsActive = !gameIsActive;
  }

  // TODO restrict to owner
  function respond_to_guess(uint wordId, uint guessNumber, address guesser, bytes memory wordGuessed, uint16 response) public {
    console.log("Response received: ", response);

    if (response == 33333) {
      // TODO: send winner money
      console.log("The correct word was guessed!");
      resetGame();
    }

    // TODO: consider sending money to word oracle? Need to keep it funded somehow
    emit GuessResult(wordId, guessNumber, guesser, wordGuessed, response);
  }
}
