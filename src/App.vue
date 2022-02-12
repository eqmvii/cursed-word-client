<template>
  <CursedWord v-if="blockchainMode"/>
  <GuessWord v-else/>
  <BlockchainToggle v-if="showToggle" @toggle-blockchain="toggleBlockchain" />
</template>

<script>
import BlockchainToggle from './components/BlockchainToggle.vue';
import CursedWord from './components/CursedWord.vue';
import GuessWord from './components/GuessWord.vue';

export default {
  name: 'App',
  components: {
    BlockchainToggle,
    CursedWord,
    GuessWord
  },
  data() {
    return {
      blockchainMode: true,
      showToggle: false,
    }
  },
  methods: {
    toggleBlockchain: function() {
      this.blockchainMode = !this.blockchainMode;
    }
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
  flex-direction: column;
}

.word-game {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  /* display: block; */
  width: 900px;
}

</style>
