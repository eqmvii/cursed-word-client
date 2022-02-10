<template>
  <CursedWord />
</template>

<script>
import Web3 from 'web3';
import CursedWord from './components/CursedWord.vue';

export default {
  name: 'App',
  components: {
    CursedWord
  },
  async mounted() {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!');
    }
    console.log('App mounted');
    // console.log(window.web3.currentProvider);

    // TODO: Configure connection for test or main net via MetaMask
    let web3 = new Web3('ws://localhost:8545');
    const accounts = await web3.eth.getAccounts();
    console.dir(accounts);
  }
}
</script>


<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;

  /* Make it nice and flex boxy */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
