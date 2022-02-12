pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

// CursedWord - public interface for the "Guess the 5 letter word" Blockchain Game

import "hardhat/console.sol";

// TODO: What is the gas implication of saving this on-chain in the smart contract.
// Are the emitted events sufficient?
struct GuessInfo {
  address guesser;
  bytes guess;
  uint wordNumber;
  uint guessNumber;
}

// A result from the oracle - the word, and the encoded response of which letters are "yellow" or "green"
// 1 - letter not in word
// 2 - letter in wrong place
// 3 - letter in correct place
struct GuessResultStruct {
  bytes guess;
  uint16 response;
}

contract CursedWordV1 {
  // TODO game reset mechanics?
  bytes32 secretWordHash; // TODO: private? Remove for current architecture?
  GuessInfo[] public guessList; // TODO: way too expensive to store all guesses in an array?
  GuessResultStruct[] public resultList; // TODO: this probably costs a billion dollars too lmao
  address winner; // TODO remove probably
  bool public gameIsActive;
  uint public wordNumber;
  uint public numberOfGuesses;

  // TODO: Timestamp?
  event GuessReceived(uint indexed wordNumber, uint guessNumber, address guesser, bytes wordGuessed);
  event GuessResult(uint indexed wordNumber,  uint guessNumber, address guesser, bytes wordGuessed, uint16 result);

  // TODO: Remove word from constructor
  // bytes, not string, for simpler access to hashing
  constructor(bytes memory firstWord) {
    // TODO: Don't store the hash of the word, since that is probably brute forceable
    secretWordHash = keccak256(firstWord);

    numberOfGuesses = 0;
    wordNumber = 1;

    gameIsActive = true;
  }

  function getGuessInfoArray() public view returns(GuessInfo[] memory) {
    return guessList;
  }

  function getResultListArray() public view returns(GuessResultStruct[] memory) {
    return resultList;
  }

  function attempt(bytes memory guess) payable public {
    require(gameIsActive == true, "Game has ended. Winner has won. Stop playing.");
    // TODO: require minimum message value for a guess?
    // TODO just record the guess and emit the event.
    // Hash the guess, to avoid the issue with comparing a memory and storage string
    // if (keccak256(guess) == secretWordHash) {
    //   console.log("The word was guessed!");
    //   winner = msg.sender;
    // } else {
    //   console.log("WRONG WROD GUESSED");
    // }
    numberOfGuesses += 1;

    guessList.push(GuessInfo(msg.sender, guess, wordNumber, numberOfGuesses));

    console.log("Number of Guesses: ", numberOfGuesses);

    emit GuessReceived(wordNumber, numberOfGuesses, msg.sender, guess);
  }

  function respond_to_guess(uint guessNumber, address guesser, bytes memory wordGuessed, uint16 response) public {
    // TODO: Restrict to WordOracle address

    console.log("Response received: ", response);

    if (response == 33333) {
      // TODO : Set winner, deactivate game, prep for next game
      // gameIsActive = false;
      // winner = guesser;
      console.log("The word was guessed!");
    }

    resultList.push(GuessResultStruct(wordGuessed, response));

    emit GuessResult(wordNumber, guessNumber, guesser, wordGuessed, response);
  }

  function claim_riches() public payable {
    // do something but only if the word was guessed
    if (msg.sender == winner) {
      // TODO better send method
      bool sent = payable(msg.sender).send(address(this).balance);
      require(sent, "Failed to send Ether");
      console.log("Was it sent?", sent);
    } else {
      console.log("You are not the winner and you cannot have all the money.");
    }
  }

  // TODO: More complex, but recommended, method of sending?
  //   function sendViaCall(address payable _to) public payable {
  //     // Call returns a boolean value indicating success or failure.
  //     // This is the current recommended method to use.
  //     (bool sent, bytes memory data) = _to.call{value: msg.value}("");
  //     require(sent, "Failed to send Ether");
  // }
}
