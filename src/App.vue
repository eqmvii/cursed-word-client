<template>
  <CursedWord v-if="appMode == 'blockchain' && !showToggle"/>
  <GuessWord v-if="appMode == 'sane' && !showToggle"/>
  <div v-if="showToggle">
    <h1>Worsle or Wordle?</h1>
    <button class="mode-button" @click="chooseMode('blockchain')">Blockchain</button>
    <button class="mode-button" @click="chooseMode('sane')">Sane</button>
  </div>
</template>

<script>
import CursedWord from './components/CursedWord.vue';
import GuessWord from './components/GuessWord.vue';

export default {
  name: 'App',
  components: {
    CursedWord,
    GuessWord
  },
  data() {
    return {
      // appMode: 'sane',
      appMode: 'blockchain',
      showToggle: false,
    }
  },
  methods: {
    chooseMode: function(choice) {
      this.showToggle = false;
      this.appMode = choice;
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


.mode-button {
  background-color: #0f521e;
  border: none;
  color: #fff;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12);
  cursor: pointer;
  margin: 8px;
}

</style>
