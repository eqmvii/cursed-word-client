<template>
  <div class="cursed-word">
    <h1>CursedWord</h1>
    <GuessList :currentGuess="currentGuess" :guesses="guesses" :results="results" />
    <Keyboard/>
    <hr/>
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

export default {
  name: 'CursedWord',
  components: {
    GuessList,
    Keyboard,
    EnableEthereumButton
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
    }
  },
  // TODO ERIC: Handle random connection to an in-progress game.
  // Or don't, lmao, that just makes it harder?
  async mounted() {
    // TODO ERIC: Remove all this and let it live in the button?
    if (typeof window.ethereum !== 'undefined') {
      // console.log('MetaMask is installed!');
    }
    // console.log('CursedWord mounted');
    // console.log(window.web3.currentProvider);

    // TODO: Configure connection for test or main net via MetaMask
    this.web3 = new Web3('ws://localhost:8545');
    // const accounts = await this.web3.eth.getAccounts();
    // console.dir(accounts);

    // Proof of smart contract life
    // Currently deployed local address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
    // console.log(CursedWordV1);

    this.connectedContract = new this.web3.eth.Contract(
      CursedWordV1.abi,
      // Must update each time contract is deployed!
      '0x5FbDB2315678afecb367f032d93F642f64180aa3' // the deployed contract's address
    );

    // console.log(this.connectedContract.methods);

    // Listen via websocket for CursedWordControl responses
    this.connectedContract.events.GuessResult()
      // .on("connected", function(subscriptionId){
      //   console.log('\nConnected to CursedContractControl events listener', subscriptionId);
      // })
      .on('data', (event) => {
        console.log('DATA CALLBACK: ' + event.returnValues.result + " for " + this.web3.utils.hexToUtf8(event.returnValues.wordGuessed));
        this.results[this.web3.utils.hexToUtf8(event.returnValues.wordGuessed)] = event.returnValues.result;
      })
      // TODO remove but handy for reference
      // eslint-disable-next-line
      .on('changed', function(event){
        console.log('?changed?', event);
      })
      .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        console.log('Event On Error', error, receipt);
      });

    window.addEventListener("keydown", e => {
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
        // TODO: move to submit guess method?
        this.submitGuess();
      }
    });
  },
  methods: {
    submitGuess: async function() {
      // TODO reorder?
      const hexedGuess = this.web3.utils.utf8ToHex(this.currentGuess.join("").toLowerCase());
      this.guesses.push(this.currentGuess.join(" "));
      this.currentGuess = [];

      console.log('data for call: ', this.connectedContract.methods.attempt(hexedGuess).encodeABI());

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
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });

    console.log('END OF SUBMIT; txHash: ', txHash);
    }
  }
}
</script>

<style scoped>

  .cursed-word {
    display: block;
    width: 900px;
  }

</style>
