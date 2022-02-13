<template>
  <div class="word-game">
    <h1>Cursed Word {{ this.wordId }}</h1>
    <p v-if="this.contractBalance">Prize: {{ this.contractBalance }} Eth</p>
    <br/>
    <GuessList
      v-if="address"
      :currentGuess="currentGuess"
      :guesses="guesses"
      :otherPlayerGuesses="otherPlayerGuesses"
      :results="results"
      :won="victory"
    />
    <br />
    <SpinningIcon v-if="awaitingResult" />
    <div v-if="victory">
      <br />
      <h1>You won!</h1>
      <ResetButton @reset="resetGame"/>
      <br />
    </div>
    <div v-if="defeat">
      <br />
      <h1>Somebody else won. Refresh for next word.</h1>
      <br />
    </div>
    <p v-if="address && this.otherPlayerGuesses.length > 0">Guesses ending in <strong>*</strong> were submitted by another player</p>
    <Keyboard :guesses="guesses" :results="results" :yellowLetters="yellowLetters" :greenLetters="greenLetters" />
    <EnableEthereumButton @metamask-connected="connect"/>
    <p v-if="this.address">{{ this.address.substring(0, 5) }}...{{ this.address.slice(-4)}} | {{ this.balance }} Eth</p>
  </div>
</template>

<script>
import Web3 from 'web3';

// Compiled smart contract code for interaction
const CURSED_WORD_CONTRACT = require('../../contracts/CursedWordV2.json');
const ACCOUNT = require('../../account.json');

// eslint-disable-next-line
const WEI_IN_AN_ETHER = 1000000000000000000;

import EnableEthereumButton from './EnableEthereumButton';
import GuessList from './GuessList.vue';
import Keyboard from './Keyboard.vue';
import ResetButton from './ResetButton';
import SpinningIcon from './SpinningIcon.vue';

export default {
  name: 'CursedWord',
  components: {
    GuessList,
    Keyboard,
    EnableEthereumButton,
    ResetButton,
    SpinningIcon
  },
  props: {
    msg: String
  },
  data() {
    return {
      currentGuess: '',
      guesses: [],
      otherPlayerGuesses: [],
      connectedContract: {},
      web3: null,
      results: {},
      yellowLetters: [],
      greenLetters: [],
      resultsReceived: [],
      inputLocked: true,
      awaitingResult: false,
      victory: false,
      defeat: false,
      wordId: null,
      address: null,
      balance: 0,
      gameLoopInterval: null,
      contractBalance: null,
    }
  },
  // TODO ERIC: Handle random connection to an in-progress game.
  async mounted() {
    // Listen for keystrokes
    window.addEventListener("keydown", e => {
      if (this.inputLocked) { return; }
      let pressed = String.fromCharCode(e.keyCode);

      // Backspace for deleting before a guess
      if (e.keyCode === 8 && this.currentGuess.length > 0) {
        this.currentGuess = this.currentGuess.slice(0, -1);
      // Letter guess A = 65 and Z = 90
      } else if (e.keyCode >= 65 && e.keyCode <= 90 && this.currentGuess.length < 5) {
        this.currentGuess += pressed.toUpperCase();
      // submit guess on enter. TODO: replace with button for integration
      } else if (e.keyCode === 13 && this.currentGuess.length === 5) {
        this.submitGuess();
      }
    });
  },
  methods: {
    connect: async function() {
      this.inputLocked = false;
      this.web3 ? '' : this.web3 = new Web3(window.ethereum);
      this.connectedContract = new this.web3.eth.Contract(CURSED_WORD_CONTRACT.abi, ACCOUNT.deployedSmartContractAddress);
      this.address = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0].toLowerCase();
      this.startNewGame();
    },
    startNewGame: async function() {
      this.wordId = await this.connectedContract.methods.id().call();
      this.gameLoopInterval = setInterval(async () => {

        this.balance = ((await this.web3.eth.getBalance(this.address)) / WEI_IN_AN_ETHER).toPrecision(4);
        this.contractBalance = ((await this.web3.eth.getBalance(ACCOUNT.deployedSmartContractAddress)) / WEI_IN_AN_ETHER).toPrecision(4);

        // TODO: Block 0 or latest or nothing below?
        this.connectedContract.getPastEvents('GuessResult', { fromBlock: 0, filter: { id: this.wordId } }).then((events) => {
          events.forEach(event => {
            if (!this.resultsReceived.includes(event.returnValues.guessNumber)) {
              this.awaitingResult = false;
              // new result received, record it and allow new entry
              let receivedWordGuess = this.web3.utils.hexToUtf8(event.returnValues.wordGuessed).toUpperCase();
              let receivedCodedResult = event.returnValues.result;
              let stringifiedReceivedCodedResult = `${receivedCodedResult}`;
              let guesserAddress = event.returnValues.guesser.toLowerCase();
              this.results[receivedWordGuess] = event.returnValues.result;
              this.guesses.push(receivedWordGuess);

              if (this.address != guesserAddress) {
                this.otherPlayerGuesses.push(receivedWordGuess);
              }

              let numGreens = 0;

              for (let i = 0; i < receivedWordGuess.length; i++) {
                if (stringifiedReceivedCodedResult[i] === '2') {
                  this.yellowLetters.push(receivedWordGuess[i].toUpperCase());
                  // TODO: uniqueify ?
                } else if (stringifiedReceivedCodedResult[i] === '3') {
                  this.greenLetters.push(receivedWordGuess[i].toUpperCase());
                  numGreens += 1;
                }
              }

              this.resultsReceived.push(event.returnValues.guessNumber);

              // If the returned result is the current guess, clear it out
              if (this.guesses.includes(this.currentGuess)) {
                this.currentGuess = '';
              }

              if (numGreens === 5 && this.address === guesserAddress) {
                this.victory = true;
                clearInterval(this.gameLoopInterval);
              } else if (numGreens === 5) {
                this.defeat = true;
                this.currentGuess = '';
                clearInterval(this.gameLoopInterval);
              } else {
                // allow another guess
                this.inputLocked = false;
              }

            }
          });
        });
      }, 1 * 1000);
    },
    submitGuess: async function() {
      this.inputLocked = true;
      const hexedGuess = this.web3.utils.utf8ToHex(this.currentGuess);

      // TODO: Cleanup, maybe understand, idk
      const transactionParameters = {
        nonce: '0x00', // ignored by MetaMask
        // important for local transaction
        gasPrice: '674006785', // customizable by user during MetaMask confirmation.
        // gas: '100', // customizable by user during MetaMask confirmation.
        to: ACCOUNT.deployedSmartContractAddress, // Required except during contract publications.
        from: window.ethereum.selectedAddress, // must match user's active address.
        // value: (0.008 * WEI_IN_AN_ETHER).toString(16),
        value: (0.25 * WEI_IN_AN_ETHER).toString(16),
        // Used for smart contract interaction
        data: this.connectedContract.methods.attempt(this.wordId, hexedGuess).encodeABI(),
        // manually setting to 31337 for local. May need to change for test net?
        // Must edit this in the network in metamask to get it to have the correct value.
        chainId: '31337', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
      };

      // txHash is a hex string. As with any RPC call, it may throw an error
      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
      this.awaitingResult = true;
    },
    resetGame: async function() {
      this.currentGuess = '';
      this.guesses = [];
      this.otherPlayerGuesses = [];
      this.results = {};
      this.yellowLetters = [];
      this.greenLetters = [];
      this.resultsReceived = [];
      this.inputLocked = false;
      this.awaitingResult = false;
      this.victory = false;
      this.defeat = false;
      this.wordId = null;

      this.startNewGame();
    }
  }
}
</script>

<style scoped>

</style>
