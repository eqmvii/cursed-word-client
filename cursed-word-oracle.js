// word-oracle.js
// Knows the secret word and responds to guesses from cursed-word-client

const Web3 = require('web3');
const CURSED_WORD_CONTRACT = require('./contracts/CursedWordV2.json');
const ACCOUNT = require('./account.json');
const SECRET = require('./secret.json');
const ORDERED_WORD_OBJECT = require('./sorted-word-list.json');
const WEI_IN_AN_ETHER = 1000000000000000000

const DEPLOYED_CONTRACT_ADDRESS = ACCOUNT.deployedSmartContractAddress;

let guessesRespondedTo = [];
let theSecretWord;

// ==== TEST public keys
// Fresh account address: 0xcbc4efe8CCf05a9435089e2F8F68622abBb7642e
// Send faucet eth here to allow for smart contract communication
// ==== END test keys

// TODO: Handle reconnect. Dictionary probably needs to be in the same order, and try not to re-send results.

const init = async () => {
  console.log('Initializing connection to Ethereum blockchain...\n');

  // use account URL or connect to localhost, depending.
  const web3 = new Web3(ACCOUNT.networkUrl ? new Web3.providers.HttpProvider(ACCOUNT.networkUrl) : 'ws://127.0.0.1:8545');

  // create account to interact with the contract
  const connectedAccount = web3.eth.accounts.privateKeyToAccount(SECRET.wordOraclePrivateKey);
  web3.eth.accounts.wallet.add(connectedAccount.privateKey);
  const connectedContract = new web3.eth.Contract(CURSED_WORD_CONTRACT.abi, DEPLOYED_CONTRACT_ADDRESS);

  // returns this as a string for some reason?
  let wordNumber = parseInt(await connectedContract.methods.id().call(), 10);

  // Always the same word for a given wordId in smart contract, regardless of prior crashes or reboots
  theSecretWord = ORDERED_WORD_OBJECT[`${wordNumber}`];

  // Get all guesses responded to already. This way if we crach/reconnect we don't pay to re-send those responses.
  let alreadyRespondedGuesses = await connectedContract.getPastEvents('GuessResult', { fromBlock: 0, filter: { id: wordNumber } })
  alreadyRespondedGuesses.forEach(event => guessesRespondedTo.push(event.returnValues.guessNumber));
  console.log(`\nAlready responded to ${guessesRespondedTo.join(", ")} for this wordId\n`)

  // Listen to guesses event stream and respond to them
  // TODO: Recursive instead of interval, to avoid double spending?
  let intervalId = setInterval(async () => {
    let balance = await web3.eth.getBalance(connectedAccount.address);

    // hard coded filter for word number for now. Eventually get from public variable in contract.
    connectedContract.getPastEvents('GuessReceived', { fromBlock: 0, filter: { id: wordNumber } }).then((events) =>
    {
      let rightNow = new Date();
      console.log(`${rightNow.getHours()}:${rightNow.getMinutes()}:${rightNow.getSeconds()} | ${ACCOUNT.network} | Word ${wordNumber} ${theSecretWord} | Oracle Balance ${(balance / WEI_IN_AN_ETHER).toPrecision(5) } | ${events.length} Guesses`);

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

          // TODO think about bug/fail state here
          guessesRespondedTo.push(event.returnValues.guessNumber);

          // TODO: Understand and fixup these gas values
          connectedContract.methods.respond_to_guess(wordNumber, event.returnValues.guessNumber, event.returnValues.guesser, web3.utils.utf8ToHex(guessedWord), responseCode).send({
            from: ACCOUNT.wordOracleAddress,
            // gasPrice (optional - gas price in wei),
            // gas (optional - max gas limit)
            gas: 250_000, // TODO make sane idk
            value: 0, // value to xfer in wei
            // nonce (optional)
          }).then(result => {
            console.log(`\n=== Response Tx sent for ${result.gasUsed} gas | Hash ${result.transactionHash} ===\n`)

            // TODO recurssion idk
          });

          // This guess won, the smart contract will increment and so will we
          if(responseCode === 33333) {
            // TODO: Consider awaiting to get the number from the deployed SC for max syncronicity?
            wordNumber += 1;
            theSecretWord = ORDERED_WORD_OBJECT[`${wordNumber}`];
            guessesRespondedTo = [];
          }
        }
      });
    });

  }, 1 * 1000);
};

function cursedWordGuessResponse(guess) {
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

  console.log(`\n=== Guessed ${guess} | Responded code ${responseArray.join(" ")} ===\n`);

  return parseInt(responseArray.join(""), 10);
}

init();


