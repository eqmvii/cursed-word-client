<template>
  <div class="cursed-word">
    <h1>Cursed Word</h1>
    <br/>
    <GuessList :currentGuess="currentGuess" :guesses="guesses" :results="results" :won="victory" />
    <br />
    <SpinningIcon v-if="awaitingResult" />
    <div v-if="victory">
      <br />
      <h1>You won!</h1>
      <br />
    </div>
    <Keyboard :guesses="guesses" :results="results" :yellowLetters="yellowLetters" :greenLetters="greenLetters" />
    <EnableEthereumButton/>
  </div>
</template>

<script>
import Web3 from 'web3';

// Compiled smart contract code for interaction
const CursedWordV1 = require('../contracts/CursedWordV1.json');

import EnableEthereumButton from './EnableEthereumButton';
import GuessList from './GuessList.vue';
import Keyboard from './Keyboard.vue';
import SpinningIcon from './SpinningIcon.vue';

export default {
  name: 'CursedWord',
  components: {
    GuessList,
    Keyboard,
    EnableEthereumButton,
    SpinningIcon
  },
  props: {
    msg: String
  },
  data() {
    return {
      count: 1,
      currentGuess: [],
      guesses: [],
      connectedContract: {},
      web3: {},
      results: {},
      yellowLetters: [],
      greenLetters: [],
      resultsReceived: [],
      inputLocked: false,
      awaitingResult: false,
      victory: false,
    }
  },
  // TODO ERIC: Handle random connection to an in-progress game.
  // Or don't, lmao, that just makes it harder?
  async mounted() {
    // TODO: Configure connection for test or main net via MetaMask
    // Can we go through MetaMask as provider? Maybe! window.web3 = new Web3(window.ethereum);
    // this.web3 = new Web3('ws://localhost:8545');
    this.web3 = new Web3(window.ethereum);

    this.connectedContract = new this.web3.eth.Contract(
      CursedWordV1.abi,
      // Must update each time contract is deployed! IT IS IN ANOTHER PLACE TOO
      '0x5FbDB2315678afecb367f032d93F642f64180aa3' // the deployed contract's address
    );

    setInterval(() => {
      // console.log('check for results...');
      // TODO: Update wordNumber once game can progress
      this.connectedContract.getPastEvents('GuessResult', { fromBlock: "latest", filter: { wordNumber: 1 } }).then((events) => {
        console.log(`events length: ${events.length}`);
        events.forEach(event => {
          // console.log(event);
          if (!this.resultsReceived.includes(event.returnValues.guessNumber)) {
            console.log('got a new event!');
            this.awaitingResult = false;
            this.guesses.push(this.currentGuess.join(" "));
            // new result received, record it and allow new entry
            let receivedWordGuess = this.web3.utils.hexToUtf8(event.returnValues.wordGuessed);
            let receivedCodedResult = event.returnValues.result;
            let stringifiedReceivedCodedResult = `${receivedCodedResult}`;
            // TODO ERIC stringify this here without breaking the rest of the app logic
            this.results[receivedWordGuess] = event.returnValues.result;

            let numGreens = 0;

            // to avoid spoiling guesses, only add green/yellow if THIS client guessed the word:
            // console.log(this.guesses.map(g => g.replace(/\s/g, '')), receivedWordGuess);
            if (this.guesses.map(g => g.replace(/\s/g, '').toLowerCase()).includes(receivedWordGuess)) {
              for (let i = 0; i < receivedWordGuess.length; i++) {
                if (stringifiedReceivedCodedResult[i] == 2) {
                  this.yellowLetters.push(receivedWordGuess[i].toLowerCase());
                  // TODO: uniqueify
                } else if (stringifiedReceivedCodedResult[i] == 3) {
                  this.greenLetters.push(receivedWordGuess[i].toLowerCase());
                  numGreens += 1;
                }
              }
            }

            this.resultsReceived.push(event.returnValues.guessNumber);
            this.currentGuess = [];
            if (numGreens === 5) {
              console.log('YOU WON!');
              this.victory = true;
            } else {
              // allow another guess
              this.inputLocked = false;
            }

          }
        });
      });
    }, 1* 1000);

    window.addEventListener("keydown", e => {
      if (this.inputLocked) { return; }
      let pressed = String.fromCharCode(e.keyCode);
      // console.log(`Key pressed: ${pressed}} | Code: ${e.keyCode} | length: ${this.currentGuess.length}`);

      // Backspace for deleting before a guess
      if (e.keyCode === 8 && this.currentGuess.length > 0) {
        this.currentGuess = this.currentGuess.slice(0, -1);
      // Letter guess
      } else if (e.keyCode >= 65 && e.keyCode <= 90 && this.currentGuess.length < 5) {
        // a = 65 and z = 90
        this.currentGuess.push(pressed);
      // submit guess on enter. TODO: replace with button for integration
      } else if (e.keyCode === 13 && this.currentGuess.length === 5) {
        console.log('submit guess');
        this.submitGuess();
      }
    });
  },
  methods: {
    submitGuess: async function() {
      this.inputLocked = true;
      // TODO reorder?
      const hexedGuess = this.web3.utils.utf8ToHex(this.currentGuess.join("").toLowerCase());
      // console.log('data for call: ', this.connectedContract.methods.attempt(hexedGuess).encodeABI());

      const transactionParameters = {
        nonce: '0x00', // ignored by MetaMask
        // important for local transaction
        gasPrice: '674006785', // customizable by user during MetaMask confirmation.
        // gas: '100', // customizable by user during MetaMask confirmation.
        to: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Required except during contract publications.
        from: window.ethereum.selectedAddress, // must match user's active address.
        value: '0x00', // Only required to send ether to the recipient from the initiating external account.
        // Used for smart contract interaction
        data: this.connectedContract.methods.attempt(hexedGuess).encodeABI(),
        // manually setting to 31337 for local. May need to change for test net?
        // Must edit this in the network in metamask to get it to have the correct value.
        chainId: '31337', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
      };

    // txHash is a hex string
    // As with any RPC call, it may throw an error

    await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });
    this.awaitingResult = true;

    // console.log('END OF SUBMIT; txHash: ', txHash);
    }
  }
}
</script>

<style scoped>

</style>
