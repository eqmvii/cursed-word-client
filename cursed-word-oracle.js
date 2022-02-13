// word-oracle.js
// Knows the secret word and responds to guesses from cursed-word-client

const Web3 = require('web3');
const CursedWordContract = require('./contracts/CursedWordV2.json');
const account = require('./account.json');
const DICTIONARY = require('./dictionary.json');
const WEI_IN_AN_ETHER = 1000000000000000000

let theSecretWord = randomWord();
const DEPLOYED_CONTRACT_ADDRESS = account.deployedSmartContractAddress;

let guessesRespondedTo = [];

// ==== TEST public keys
// Fresh account address: 0xcbc4efe8CCf05a9435089e2F8F68622abBb7642e
// Send faucet eth here to allow for smart contract communication
// ==== END test keys

// TODO: Handle reconnect. Dictionary probably needs to be in the same order, and try not to re-send results.

const init = async () => {
  console.log('Initializing connection to Ethereum blockchain...\n');

  const web3 = new Web3(Web3.givenProvider || "ws://127.0.0.1:8545");

  // create account to interact with the contract
  const freshAccount = web3.eth.accounts.privateKeyToAccount(account.privateKey);
  web3.eth.accounts.wallet.add(freshAccount.privateKey);
  const connectedContract = new web3.eth.Contract(CursedWordContract.abi, DEPLOYED_CONTRACT_ADDRESS);

  // returns this as a string for some reason?
  let wordNumber = parseInt(await connectedContract.methods.id().call(), 10);

  // Listen to guesses event stream and respond to them
  let intervalId = setInterval(async () => {
    let balance = await web3.eth.getBalance(freshAccount.address);

    // hard coded filter for word number for now. Eventually get from public variable in contract.
    connectedContract.getPastEvents('GuessReceived', { fromBlock: 0, filter: { id: wordNumber } }).then((events) =>
    {
      let rightNow = new Date();
      console.log(`${rightNow.getHours()}:${rightNow.getMinutes()}:${rightNow.getSeconds()} | Word ${wordNumber} ${theSecretWord} | Balance: ${(balance / WEI_IN_AN_ETHER).toPrecision(5) } | ${events.length} guesses`);

      events.forEach(event => {

        // Respond to any new events
        if (!guessesRespondedTo.includes(event.returnValues.guessNumber)) {
          console.log(`\nWord ${wordNumber}, Guess ${event.returnValues.guessNumber}: ${web3.utils.hexToUtf8(event.returnValues.wordGuessed)}\n`);
          let guessedWord = web3.utils.hexToUtf8(event.returnValues.wordGuessed).toUpperCase();
          let responseCode = cursedWordGuessResponse(guessedWord);

          if (guessedWord.length != 5) {
            // 5 0s as an "error code"
            guessedWord = '-----';
            responseCode = 11111;
          }

          // TODO: Understand and fixup these values
          connectedContract.methods.respond_to_guess(wordNumber, event.returnValues.guessNumber, event.returnValues.guesser, web3.utils.utf8ToHex(guessedWord), responseCode).send({
            from: freshAccount.address,
            // gasPrice (optional - gas price in wei),
            // gas (optional - max gas limit)
            gas: 250_000, // TODO make sane idk
            value: 0, // value to xfer in wei
            // nonce (optional)
          });

          guessesRespondedTo.push(event.returnValues.guessNumber);

          // This guess won, the smart contract will increment and so will we
          if(responseCode === 33333) {
            // TODO: Consider awaiting to get the number from the deployed SC for max syncronicity?
            wordNumber += 1;
            guessesRespondedTo = [];
            theSecretWord = randomWord();
          }
        }
      });
    });

  }, 1 * 1000);
};

function randomWord() {
  // TODO: avoid reuse?
  // TODO: to protect from crashes, pre-randomize list so that number always matches contract wordId
  return DICTIONARY.wordList[Math.floor(Math.random()*DICTIONARY.wordList.length)].toUpperCase();
}

function cursedWordGuessResponse(guess) {
  console.log("Correct answer is " + theSecretWord);
  let responseArray = [];
  let remainingLetters = [];

  // record exact matches and remaining letters
  for(let i = 0; i < theSecretWord.length; i++) {
    if (guess[i] === theSecretWord[i]) {
      responseArray.push("3");
    } else {
      responseArray.push("1");
      remainingLetters.push(theSecretWord[i]);
    }
  }

  // record "2" for letters in the word but in the wrong place and "3" for correct letters
  for (let i = 0; i < guess.length; i++) {
    if (responseArray[i] !== "3" && remainingLetters.indexOf(guess[i]) >= 0) {
      responseArray[i] = "2";
      // remove this letter from the remaining letters array
      remainingLetters.splice(remainingLetters.indexOf(guess[i]), 1);
    }
  }

  console.log(guess + ": " + responseArray.join(" "));

  return parseInt(responseArray.join(""), 10);
}

init();


