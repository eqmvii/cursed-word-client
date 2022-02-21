// word-oracle.js
// Knows the secret word and responds to guesses from cursed-word-client

const Web3 = require('web3');
const CURSED_WORD_CONTRACT = require('./contracts/TestCWGU.json');
const CURSED_WORD_COIN_CONTRACT = require('./contracts/CWCoin.json');
const CURSED_WORD_TROPHY_CONTRACT = require('./contracts/CursedWordTrophyV2.json');
const ACCOUNT = require('./account.json');
const SECRET = require('./secret.json');
const ORDERED_WORD_OBJECT = require('./sorted-word-list.json');
const WEI_IN_AN_ETHER = 1000000000000000000;
const POLL_RATE = 3 * 1000; // 3 seconds ; infura connection only allows 100,000 request/day on free tier SO.
const LOG_BALANCE = ACCOUNT.network === 'localhost';

const COIN_REWARD = '10'; // string for big number conversion

const DEPLOYED_CONTRACT_ADDRESS = ACCOUNT.deployedGameAddress;
const DEPLOYED_COIN_ADDRESS = ACCOUNT.deployedCoinAddress;
const DEPLOYED_NFT_ADDRESS = ACCOUNT.deployedNFTAddress;

// TODO refactor to just hold all guess events receieved, like FE now does
let guessesRespondedTo = [];
let theSecretWord;

// ==== TEST public keys
// Fresh account address: 0xcbc4efe8CCf05a9435089e2F8F68622abBb7642e
// Send faucet eth here to allow for smart contract communication
// ==== END test keys

const init = async () => {
  console.log('\nInitializing connection to Ethereum blockchain...');

  // use account URL or connect to localhost, depending.
  const web3 = new Web3(ACCOUNT.network == 'rinkeby' ? new Web3.providers.HttpProvider(SECRET.rinkebyNetworkUrl) : 'ws://127.0.0.1:8545');

  // create account to interact with the contract
  const connectedAccount = web3.eth.accounts.privateKeyToAccount(SECRET.wordOraclePrivateKey);
  web3.eth.accounts.wallet.add(connectedAccount.privateKey);
  const connectedContract = new web3.eth.Contract(CURSED_WORD_CONTRACT.abi, DEPLOYED_CONTRACT_ADDRESS);
  const connectedCoinContract = new web3.eth.Contract(CURSED_WORD_COIN_CONTRACT.abi, DEPLOYED_COIN_ADDRESS);
  const connectedNFTContract = new web3.eth.Contract(CURSED_WORD_TROPHY_CONTRACT.abi, DEPLOYED_NFT_ADDRESS);

  // returns this as a string for some reason?
  let wordNumber = parseInt(await connectedContract.methods.id().call(), 10);

  // Always the same word for a given wordId in smart contract, regardless of prior crashes or reboots
  theSecretWord = ORDERED_WORD_OBJECT[`${wordNumber}`];

  // Get all guesses responded to already. This way if we crach/reconnect we don't pay to re-send those responses.
  let alreadyRespondedGuesses = await connectedContract.getPastEvents('GuessResult', { fromBlock: 0, filter: { id: wordNumber } })
  alreadyRespondedGuesses.forEach(event => guessesRespondedTo.push(event.returnValues.guessNumber));
  if (guessesRespondedTo.length > 0 ) { console.log(`\nAlready responded to ${guessesRespondedTo.join(", ")} for this wordId`) }

  let responseFunction = async () =>  {
    // Infura tracks total requests, and this is like half of them, so cut it in prod
    let balance = 0;
    if (LOG_BALANCE) {
      balance = await web3.eth.getBalance(connectedAccount.address);
    }

    // hard coded filter for word number for now. Eventually get from public variable in contract.
    let events = await connectedContract.getPastEvents('GuessReceived', { fromBlock: 0, filter: { id: wordNumber } });

    let rightNow = new Date();
    console.log(`${rightNow.getHours()}:${rightNow.getMinutes()}:${rightNow.getSeconds()} | ${ACCOUNT.network} ${ACCOUNT.oracleAddress.substring(0, 6)} | Word ${wordNumber} ${theSecretWord} | Balance (${LOG_BALANCE}) ${(balance / WEI_IN_AN_ETHER).toPrecision(5) } | ${events.length} Guesses`);

    // LOL forEach can't be usesd with async/await patterns. TIL: https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
    // events.forEach(async (event) => {
    for (const event of events) {
      if (event.returnValues.id != wordNumber) {
        console.log(`\Received guess #${event.returnValues.guessNumber} for word #${event.returnValues.id}, but we are on word #${wordNumber}`);
      }

      // Respond to any new events FOR THIS WORD ID. Skip any guesses that came after winning guess.
      if (event.returnValues.id == wordNumber && !guessesRespondedTo.includes(event.returnValues.guessNumber)) {
        console.log(`\nWord ${wordNumber}, Guess ${event.returnValues.guessNumber}: ${web3.utils.hexToUtf8(event.returnValues.wordGuessed)}`);
        let guessedWord = web3.utils.hexToUtf8(event.returnValues.wordGuessed).toUpperCase();
        let responseCode = cursedWordGuessResponse(guessedWord);

        if (guessedWord.length != 5) {
          // 5 0s as an "error code"
          guessedWord = '-----';
          responseCode = 11111;
        }

        // TODO think about bug/fail state here
        guessesRespondedTo.push(event.returnValues.guessNumber);

        try {
          // TODO: Understand and fixup these gas values
          let responseResult = await connectedContract.methods.respond_to_guess(wordNumber, event.returnValues.guessNumber, event.returnValues.guesser, web3.utils.utf8ToHex(guessedWord), responseCode).send({
            from: ACCOUNT.oracleAddress,
            // gasPrice (optional - gas price in wei),
            gas: 250_000, // (optional) gas limit for this transaction
            value: 0, // value to xfer in wei
            // nonce (optional)
          });
          console.log(`\n=== Response Tx sent for ${responseResult.gasUsed} gas | Hash ${responseResult.transactionHash} ===`);

          let guessedWordNumber = wordNumber;
          // This guess won, the smart contract will increment and so will we
          // In theory this will only first once because even if multiple guesses come in on the same word number,
          // we will increment wordNumber on the first we see not check any events from that wordNumber again.
          if (responseCode === 33333) {
            // TODO: this gets SUPER EXPENSIVE while it sits with open guesses. every 1.5 seconds you do 1x eth call per open guess.
            // Get the current wordId and word to make sure the guess matches it
            // wordNumber = await connectedContract.methods.id().call();
            wordNumber += 1;
            theSecretWord = ORDERED_WORD_OBJECT[`${wordNumber}`];

            // Send the winner some CWCoins and the CWNFT
            try {

              await connectedCoinContract.methods.mint(event.returnValues.guesser, web3.utils.toWei(COIN_REWARD)).send({
                from: ACCOUNT.oracleAddress,
                gas: 250_000,
                value: 0,
              });
              console.log(`\n=== Sent ${COIN_REWARD} CWCoin reward to winner!`);
            } catch (e) {
              console.log('\n===Rejected Coin mint promise\n\n', e);
            }

                      // Send the winner an NFT for their winning guess
            try {
              await connectedNFTContract.methods.safeMint(event.returnValues.guesser, guessedWordNumber, `nft/${guessedWordNumber}`).send({
                from: ACCOUNT.oracleAddress,
                gas: 250_000,
                value: 0, // value to xfer in wei
              });
              console.log(`\n=== Sent NFT Trophy #${guessedWordNumber} to winner!\n`);
            } catch (e) {
              console.log('\n=== Rejected NFT mint promise\n\n', e);
            }

            guessesRespondedTo = []; // TODO: this is slightly buggy if multiple guesses come in after a win
          }
        } catch (e) {
          console.log('\n=== Rejectedresponse, THIS ONE IS BAD IDK ~ \n\n', e);
        }
      }
    }

    setTimeout(responseFunction, POLL_RATE);
  }

  // Listen to guesses event stream and respond to them
  setTimeout(responseFunction, POLL_RATE);
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

  console.log(`\n=== Guessed ${guess} | Responded code ${responseArray.join(" ")} ===`);

  return parseInt(responseArray.join(""), 10);
}

init();


