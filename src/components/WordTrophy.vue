<template>
  <div class="trophy">
    <h1>Word #{{ this.wordId }}</h1>
    <GuessList
      :currentGuess="''"
      :guesses="guesses"
      :won="true"
      :myAddress="myAddress"
    />
    <br />
    <p>Winning Guess By:</p>
    <h3>{{ this.winningAddress }}</h3>
  </div>
</template>

<script>
import GuessList from './GuessList';
// import Keyboard from './Keyboard';

export default {
  name: 'WordTrophy',
  components: {
    GuessList,
    // Keyboard
  },
  props: {
    guesses: Array,
    myAddress: String,
    wordId: String,
    winningAddress: String,
  },
  computed: {
    letterColorObject: function() {
      let letterColors = { green: [], yellow: [] };
      this.guesses.forEach(g => {
        for (let i = 0; i < g.result.length; i++) {
          if (g.result[i] === '3') {
            letterColors.green.push(g.guess[i]);
          } else if (g.result[i] === '2') {
            letterColors.yellow.push(g.guess[i]);
          }
        }
      });

      return letterColors;
    },
  },
  methods: {
    yellowLetters: function () {
      return this.letterColorObject.yellow;
    },
    greenLetters: function () {
      return this.letterColorObject.green;
    }
  }
}
</script>

<style scoped>

.trophy {
  border: 2px solid grey;
  border-radius: 5px;
  box-shadow: 1px 2px #888888;
  padding: 20px;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  width: 500px;
}

</style>
