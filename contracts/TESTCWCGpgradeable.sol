pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

contract TestCWGU {
  uint public id;
  uint public numberOfGuesses;
  address public contractOwner;

  event GuessReceived(uint indexed id, uint guessNumber, address guesser, bytes wordGuessed);
  event GuessResult(uint indexed id,  uint guessNumber, address guesser, bytes wordGuessed, uint indexed result);

  constructor() {
    id = 1;
    numberOfGuesses = 1;
    contractOwner = 0xcbc4efe8CCf05a9435089e2F8F68622abBb7642e;
  }

  function attempt(uint wordId, bytes memory guess) payable public {
    require(id == wordId, "This word has already been solved.");
    require(msg.value >= (45000 * tx.gasprice), "send eth for oracle response fees");

    (bool sentToOwner, bytes memory _ownserSendData) = contractOwner.call{value: address(this).balance}("");
    require(sentToOwner, "Failed to send oracle eth");

    emit GuessReceived(id, numberOfGuesses, msg.sender, guess);
    numberOfGuesses += 1; // moving this here so all guesses are low gas and more fee is in contract creation
  }

  function resetGame() private {
    id += 1;
    numberOfGuesses = 1;
  }

  function respond_to_guess(uint wordId, uint guessNumber, address payable guesser, bytes memory wordGuessed, uint response) public payable {
    require(msg.sender == contractOwner, "Unauthorized");

    if (response == 33333) {
      resetGame();
    }

    emit GuessResult(wordId, guessNumber, guesser, wordGuessed, response);
  }
}
