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
    <p v-if="address && this.otherPlayerGuesses.length > 0">Guesses ending in <strong>*</strong> were submitted by another player</p>
    <div v-if="victory">
      <br />
      <h1>You won!</h1>
      <ResetButton @reset="resetGame"/>
      <br />
    </div>
    <div v-if="defeat">
      <br />
      <h1>Somebody else won :(</h1>
      <ResetButton @reset="resetGame"/>
      <br />
    </div>
    <Keyboard :guesses="guesses" :results="results" :yellowLetters="yellowLetters" :greenLetters="greenLetters" />
    <EnableEthereumButton @metamask-connected="connect"/>
    <p v-if="this.address">{{ this.address.substring(0, 5) }}...{{ this.address.slice(-4)}} | {{ this.ethBalance }} Eth | {{ this.cwcBalance }} CWCoin </p>
  </div>
</template>

<script>
import Web3 from 'web3';


// Compiled smart contract code for interaction
const CURSED_WORD_GAME_CONTRACT = require('../../contracts/TestCWGU.json');
const CURSED_WORD_COIN_CONTRACT = require('../../contracts/CWCoin.json');
const ACCOUNT = require('../../account.json');

// eslint-disable-next-line
const WEI_IN_AN_ETHER = 1000000000000000000;

import EnableEthereumButton from './EnableEthereumButton';
import GuessList from './GuessList';
import Keyboard from './Keyboard';
import ResetButton from './ResetButton';
import SpinningIcon from './SpinningIcon';

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
      connectedContract: {}, // TODO: null?
      connectedCoinContract: {},
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
      ethBalance: 0, // TODO: Null? With conditionals?
      cwcBalance: null,
      gameLoopInterval: null,
      contractBalance: null,
    }
  },
  // TODO ERIC: Handle random connection to an in-progress game.
  async mounted() {
    // Listen for keystrokes
    // TODO: remove this in beforeDestroy if implementing toggle
    window.addEventListener("keydown", this.handleKeyDown);
  },
  methods: {
    connect: async function() {
      this.web3 = new Web3(window.ethereum);
      this.connectedContract = new this.web3.eth.Contract(CURSED_WORD_GAME_CONTRACT.abi, ACCOUNT.deployedGameAddress);
      this.connectedCoinContract = new this.web3.eth.Contract(CURSED_WORD_COIN_CONTRACT.abi, ACCOUNT.deployedCoinAddress);
      this.address = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0].toLowerCase();

      this.startNewGame();
    },
    handleKeyDown: function(e) {
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
    },
    startNewGame: async function() {
      this.wordId = await this.connectedContract.methods.id().call();
      this.inputLocked = false;

      this.gameLoopInterval = setInterval(async () => {

        this.ethBalance = ((await this.web3.eth.getBalance(this.address)) / WEI_IN_AN_ETHER).toPrecision(4);
        this.cwcBalance = ((await this.connectedCoinContract.methods.balanceOf(this.address).call()) / WEI_IN_AN_ETHER).toPrecision(4);
        this.contractBalance = ((await this.web3.eth.getBalance(ACCOUNT.deployedGameAddress)) / WEI_IN_AN_ETHER).toPrecision(4);

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
                clearInterval(this.gameLoopInterval);
                this.inputLocked = true;
                this.victory = true;
              } else if (numGreens === 5) {
                clearInterval(this.gameLoopInterval);
                this.inputLocked = true;
                this.defeat = true;
              }
            }
          });
        });
      }, 1 * 1000);
    },
    submitGuess: async function() {
      this.inputLocked = true;

      let currentGasPrice = await this.web3.eth.getGasPrice();

      // Collect enough eth to cover cost of oracle server calling reply function in game contract.
      // Replies use just under 50k gas in the worst case scenario.
      // TODO: Increase if also calling mint functions?
      const txValue = currentGasPrice * 105000;

      const transactionParameters = {
        to: ACCOUNT.deployedGameAddress,
        from: window.ethereum.selectedAddress,
        value: (txValue).toString(16),
        data: this.connectedContract.methods.attempt(this.wordId, this.web3.utils.utf8ToHex(this.currentGuess)).encodeABI(),
      };

      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      this.inputLocked = false;
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
