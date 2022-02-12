// word-oracle.js
// Knows the secret word and responds to guesses from cursed-word-client

const Web3 = require('web3');
const CursedWordV1 = require('./contracts/CursedWordV1.json');
const account = require('./account.json');

const THE_SECRET_WORD = "TREAT";
const SEND_DEBUG_GUESS = false;
const DEPLOYED_CONTRACT_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';

const guessesRespondedTo = [];

// ==== TEST public keys
// Fresh account address: 0xcbc4efe8CCf05a9435089e2F8F68622abBb7642e
// Send faucet eth here to allow for smart contract communication
// ==== END test keys

const init = async () => {
  console.log('Initializing connection to Ethereum blockchain...\n');

  const web3 = new Web3(Web3.givenProvider || "ws://127.0.0.1:8545");
  const THE_SECRET_WORD_HEX = web3.utils.utf8ToHex(THE_SECRET_WORD);

  // create account to interact with the contract
  const freshAccount = web3.eth.accounts.privateKeyToAccount(account.privateKey);
  web3.eth.accounts.wallet.add(freshAccount.privateKey);
  const connectedContract = new web3.eth.Contract(CursedWordV1.abi, DEPLOYED_CONTRACT_ADDRESS);

  // Listen to guesses event stream and respond to them
  setInterval(() => {
    web3.eth.getBalance(freshAccount.address).then((balance) => {
      console.log(`${Date.now()} Current Balance: ${balance}`);
    });

    // hard coded filter for word number for now. Eventually get from public variable in contract.
    connectedContract.getPastEvents('GuessReceived', { fromBlock: 0, filter: { wordNumber: 1 } }).then((events) =>
    {
      events.forEach(event => {
        console.log(`${event.returnValues.guessNumber}: ${web3.utils.hexToUtf8(event.returnValues.wordGuessed)}`);

        // TODO: sort by guess number? Can we rely on that ordering by default?

        // Respond to any new events
        if (!guessesRespondedTo.includes(event.returnValues.guessNumber)) {
          const guessedWord = web3.utils.hexToUtf8(event.returnValues.wordGuessed);
          console.log('data callback ', event.returnValues.wordGuessed);
          console.log(`is ${guessedWord} the secret word? ${guessedWord == THE_SECRET_WORD}`);
          const responseCode = cursedWordGuessResponse(guessedWord);

          connectedContract.methods.respond_to_guess(event.returnValues.guessNumber, event.returnValues.guesser, event.returnValues.wordGuessed, responseCode).send({
            from: freshAccount.address,
            // gasPrice (optional - gas price in wei),
            // gas (optional - max gas limit)
            gas: 250_000, // TODO make sane idk
            value: 0, // value to xfer in wei
            // nonce (optional)
          });

          guessesRespondedTo.push(event.returnValues.guessNumber);
        }
      });
    });

  }, 1 * 1000);
};

function cursedWordGuessResponse(guess) {
  console.log("Correct answer is " + THE_SECRET_WORD);
  let responseArray = [];
  let remainingLetters = [];

  // record exact matches and remaining letters
  for(let i = 0; i < THE_SECRET_WORD.length; i++) {
    if (guess[i] === THE_SECRET_WORD[i]) {
      responseArray.push("3");
    } else {
      responseArray.push("1");
      remainingLetters.push(THE_SECRET_WORD[i]);
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

// START
init();


