<template>
  <div class="word-game">
    <WordTrophy
      v-if="this.wordId && this.guesses.length > 0 && this.winningAddress"
      :guesses="this.guesses"
      :wordId="this.wordId"
      :myAddress="this.winningAddress"
    />
    <br />
    <EnableEthereumButton @metamask-connected="connect"/>
  </div>
</template>

<script>
import Web3 from 'web3';

// Compiled smart contract code for interaction
const CURSED_WORD_GAME_CONTRACT = require('../../contracts/TestCWGU.json');
const CURSED_WORD_NFT_CONTRACT = require('../../contracts/CursedWordTrophyV2.json');
const ACCOUNT = require('../../account.json');

import EnableEthereumButton from './EnableEthereumButton';
import WordTrophy from './WordTrophy';

export default {
  name: 'TrophyPage',
  components: {
    EnableEthereumButton,
    WordTrophy
  },
  data() {
    return {
      guesses: [],
      connectedContract: null,
      connectedNFTContract: null,
      web3: null,
      wordId: null,
      address: null,
      winningAddress: null,
    }
  },
  mounted() {
    console.log(this.$route.params.id);
  },
  methods: {
    connect: async function() {
      this.web3 = new Web3(window.ethereum);
      this.connectedContract = new this.web3.eth.Contract(CURSED_WORD_GAME_CONTRACT.abi, ACCOUNT.deployedGameAddress);
      this.connectedNFTContract = new this.web3.eth.Contract(CURSED_WORD_NFT_CONTRACT.abi, ACCOUNT.deployedNFTAddress);
      this.address = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0].toLowerCase();

      this.wordId = this.$route.params.id;

      let events = await this.connectedContract.getPastEvents('GuessResult', { fromBlock: 0, filter: { id: this.wordId } });
      console.log(events);
      for (const event of events) {
        let receivedWordGuess = this.web3.utils.hexToUtf8(event.returnValues.wordGuessed).toUpperCase();
        let receivedCodedResult = event.returnValues.result;
        this.guesses.push({
          guess: receivedWordGuess,
          guesser: event.returnValues.guesser,
          result: receivedCodedResult,
          wordId: event.returnValues.id,
          guessNumber: event.returnValues.guessNumber
        });

        if (receivedCodedResult === '33333') {
          this.winningAddress = event.returnValues.guesser
        }
      }

      console.log(this.guesses);
    },
  }
}
</script>

<style scoped>

</style>
