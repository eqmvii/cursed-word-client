<template>
  <div class="word-game">
    <h1>Cursed Word {{ this.wordId }}</h1>
    <br/>
    <GuessList
      :currentGuess="currentGuess"
      :guesses="guesses"
      :won="victory"
      :myAddress="address"
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
      <h1>Somebody else won :(</h1>
      <ResetButton @reset="resetGame"/>
      <br />
    </div>
    <KeyboardElement :guesses="guesses" :yellowLetters="yellowLetters" :greenLetters="greenLetters" />
    <EnableEthereumButton @metamask-connected="connect"/>
    <p v-if="this.address && this.ethBalance">{{ this.address.substring(0, 5) }}...{{ this.address.slice(-4)}} <strong>|</strong> {{ this.ethBalance }} Eth <strong>|</strong> {{ this.cwcBalance }} CW Coins </p>
    <h2>My NFTs:</h2>
    <ul>
      <li v-for="token in myNFTs" :key="token.id">({{ token.id }}) <button @click="openModal(token.id)">|{{ token.id }}|</button><a :href="token.uri">{{ token.uri }}</a></li>
    </ul>
    <!-- TODO: update this to fetch needed data, right now this is only for testing -->
    <ModalElement
      :open="this.modalOpen"
      @closeModal="closeModal"
      v-if="this.address && this.guesses && this.wordId && this.guesses.length > 0"
    >
      <WordTrophy
        :guesses="this.modalData.guesses"
        :wordId="this.modalData.wordId"
        :myAddress="this.address"
      />
    </ModalElement>
  </div>
</template>

<script>
import Web3 from 'web3';

// Compiled smart contract code for interaction
const CURSED_WORD_GAME_CONTRACT = require('../../contracts/TestCWGU.json');
const CURSED_WORD_COIN_CONTRACT = require('../../contracts/CWCoin.json');
const CURSED_WORD_NFT_CONTRACT = require('../../contracts/CursedWordTrophyV2.json');
const ACCOUNT = require('../../account.json');

// eslint-disable-next-line
const WEI_IN_AN_ETHER = 1000000000000000000;

import EnableEthereumButton from './EnableEthereumButton';
import GuessList from './GuessList';
import KeyboardElement from './KeyboardElement';
import ModalElement from './ModalElement';
import ResetButton from './ResetButton';
import SpinningIcon from './SpinningIcon';
import WordTrophy from './WordTrophy';

export default {
  name: 'CursedWord',
  components: {
    GuessList,
    KeyboardElement,
    ModalElement,
    EnableEthereumButton,
    ResetButton,
    SpinningIcon,
    WordTrophy
  },
  data() {
    return {
      currentGuess: '',
      guesses: [],
      connectedContract: null,
      connectedCoinContract: null,
      connectedNFTContract: null,
      web3: null,
      yellowLetters: [],
      greenLetters: [],
      inputLocked: true,
      awaitingResult: false,
      victory: false,
      defeat: false,
      wordId: null,
      address: null,
      ethBalance: null,
      cwcBalance: null,
      gameLoopInterval: null,
      myNFTs: [],
      modalOpen: false,
      modalData: {},
    }
  },
  async mounted() {
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeUnmount() {
    console.log('beforeUnmount');
    window.removeEventListener('keydown', this.handleKeyDown);
    clearInterval(this.gameLoopInterval);
  },
  methods: {
    connect: async function() {
      this.web3 = new Web3(window.ethereum);
      this.connectedContract = new this.web3.eth.Contract(CURSED_WORD_GAME_CONTRACT.abi, ACCOUNT.deployedGameAddress);
      this.connectedCoinContract = new this.web3.eth.Contract(CURSED_WORD_COIN_CONTRACT.abi, ACCOUNT.deployedCoinAddress);
      this.connectedNFTContract = new this.web3.eth.Contract(CURSED_WORD_NFT_CONTRACT.abi, ACCOUNT.deployedNFTAddress);
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

      let responsePollFunc = async () => {
        this.updateBalances();
        let events = await this.connectedContract.getPastEvents('GuessResult', { fromBlock: 0, filter: { id: this.wordId } });

        for (const event of events) {
          if (!this.guesses.map(g => g.guessNumber).includes(event.returnValues.guessNumber)) {
            this.awaitingResult = false;
            let receivedWordGuess = this.web3.utils.hexToUtf8(event.returnValues.wordGuessed).toUpperCase();
            let receivedCodedResult = event.returnValues.result;
            let stringifiedReceivedCodedResult = `${receivedCodedResult}`;
            let guesserAddress = event.returnValues.guesser.toLowerCase();
            this.guesses.push({
              guess: receivedWordGuess,
              guesser: event.returnValues.guesser,
              result: receivedCodedResult,
              wordId: event.returnValues.id,
              guessNumber: event.returnValues.guessNumber
            });

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

            // If I just got the result from MY guess, let me guess again
            if (this.currentGuess === receivedWordGuess && this.address.toLowerCase() === guesserAddress) {
              this.currentGuess = '';
            }

            if (numGreens === 5 && this.address === guesserAddress) {
              clearInterval(this.gameLoopInterval);
              this.updateBalances();
              this.inputLocked = true;
              this.victory = true;
            } else if (numGreens === 5) {
              clearInterval(this.gameLoopInterval);
              this.inputLocked = true;
              this.defeat = true;
            }
          }
        }
      }

      this.gameLoopInterval = setInterval(responsePollFunc, 1 * 1000);
    },
    submitGuess: async function() {
      this.inputLocked = true;

      let currentGasPrice = await this.web3.eth.getGasPrice();

      // Collect enough eth to cover cost of oracle server calling reply function in game contract.
      // Replies use just under 50k gas in the worst case scenario.
      // TODO LIVE: Make better, this fails in weird ways due to test net price fixing
      const txValue = currentGasPrice * 115000;

      const transactionParameters = {
        to: ACCOUNT.deployedGameAddress,
        from: window.ethereum.selectedAddress,
        value: (txValue).toString(16),
        // value: (1000000000000000).toString(16),
        data: this.connectedContract.methods.attempt(this.wordId, this.web3.utils.utf8ToHex(this.currentGuess)).encodeABI(),
      };

      try {
        await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        });
      } catch (e) {
        console.log('Error sending guess: ', e);
      }

      this.inputLocked = false;
      this.awaitingResult = true;
    },
    resetGame: async function() {
      this.currentGuess = '';
      this.guesses = [];
      this.yellowLetters = [];
      this.greenLetters = [];
      this.inputLocked = false;
      this.awaitingResult = false;
      this.victory = false;
      this.defeat = false;
      this.wordId = null;
      this.modalOpen = false;
      this.modalData = {},

      this.startNewGame();
    },
    updateBalances: async function() {
      this.ethBalance = ((await this.web3.eth.getBalance(this.address)) / WEI_IN_AN_ETHER).toPrecision(5);
      this.cwcBalance = Math.round(((await this.connectedCoinContract.methods.balanceOf(this.address).call()) / WEI_IN_AN_ETHER));

      // Is this too expensive to do every cycle?
      let myNFTBalance = await this.connectedNFTContract.methods.balanceOf(this.address).call();
      let theNFTs = [];
      for (let i = 0; i < myNFTBalance; i++) {
        let tokenId = await this.connectedNFTContract.methods.tokenOfOwnerByIndex(this.address, i).call();
        theNFTs.push({ id: tokenId, uri: await this.connectedNFTContract.methods.tokenURI(tokenId).call() });
      }

      this.myNFTs = theNFTs;
    },
    async openModal(tokenId) {
      console.log(tokenId);
      this.modalData.guesses = [];
      this.modalData.wordId = tokenId;

      let events = await this.connectedContract.getPastEvents('GuessResult', { fromBlock: 0, filter: { id: tokenId } });

      for (const event of events) {
        let receivedWordGuess = this.web3.utils.hexToUtf8(event.returnValues.wordGuessed).toUpperCase();
        let receivedCodedResult = event.returnValues.result;
        this.modalData.guesses.push({
          guess: receivedWordGuess,
          guesser: event.returnValues.guesser,
          result: receivedCodedResult,
          wordId: event.returnValues.id,
          guessNumber: event.returnValues.guessNumber
        });
      }

      console.log(this.modalData.guesses);

      this.modalOpen = true;
    },
    closeModal() {
      // TODO: Consider reworking logic to read event and not close if clicking into modal content
      this.modalOpen = false;
    }
  }
}
</script>

<style scoped>

</style>
