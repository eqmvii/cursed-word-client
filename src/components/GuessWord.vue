<template>
  <div class="word-game">
    <h1>Guess Word</h1>
    <br/>
    <GuessList
      :currentGuess="currentGuess"
      :guesses="guesses"
      :otherPlayerGuesses="[]"
      :results="results"
      :won="victory"
    />
    <br />
    <SpinningIcon v-if="awaitingResult" />
    <div v-if="victory">
      <h1>You won!</h1>
      <ResetButton @reset="resetGame"/>
      <br />
    </div>
    <Keyboard :guesses="guesses" :results="results" :yellowLetters="yellowLetters" :greenLetters="greenLetters" />
  </div>
</template>

<script>
import GuessList from './GuessList';
import Keyboard from './Keyboard';
import ResetButton from './ResetButton';
import SpinningIcon from './SpinningIcon';

const DICTIONARY = require('./../../dictionary.json');

export default {
  name: 'GuessWord',
  components: {
    GuessList,
    Keyboard,
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
      results: {},
      yellowLetters: [],
      greenLetters: [],
      inputLocked: false,
      awaitingResult: false,
      victory: false,
      secretWord: this.randomWord(),
      logAnswer: false,
    }
  },
  async mounted() {
    if (this.logAnswer) { console.log(this.secretWord); }
    // TODO: move to named function
    window.addEventListener("keydown", e => {
      if (this.inputLocked) { return; }
      let pressed = String.fromCharCode(e.keyCode);

      // Backspace for deleting before a guess
      if (e.keyCode === 8 && this.currentGuess.length > 0) {
        this.currentGuess = this.currentGuess.slice(0, -1);
      // Letter guess; a = 65 and z = 90
      } else if (e.keyCode >= 65 && e.keyCode <= 90 && this.currentGuess.length < 5) {
        this.currentGuess = this.currentGuess + pressed.toUpperCase();
      // submit guess on enter. TODO: replace with button for integration?
      } else if (e.keyCode === 13 && this.currentGuess.length === 5) {
        this.submitGuess();
      }
    });
  },
  methods: {
    submitGuess: function() {
      this.guesses.push({ guess: this.currentGuess, guesser: 'self' });
      let respCode = this.guessResponse();
      this.results[this.currentGuess] = respCode;
      let numGreens = 0;

      for (let i = 0; i < this.currentGuess.length; i++) {
        if (respCode[i] === "2") {
          this.yellowLetters.push(this.currentGuess[i]);
        } else if (respCode[i] === "3") {
          this.greenLetters.push(this.currentGuess[i]);
          numGreens += 1;
        }
      }

      this.currentGuess = '';

      if (numGreens === 5) {
        this.victory = true;
      }
    },
    guessResponse() {
      // Encode results as number string to match blockchain version
      let responseArray = [];
      let remainingLetters = [];

      // record exact matches and remaining letters
      for(let i = 0; i < this.secretWord.length; i++) {
        if (this.currentGuess[i] === this.secretWord[i]) {
          responseArray.push('3');
        } else {
          responseArray.push('1');
          remainingLetters.push(this.secretWord[i]);
        }
      }

      // record "2" for letters in the word but in the wrong place
      for (let i = 0; i < this.currentGuess.length; i++) {
        if (responseArray[i] !== '3' && remainingLetters.indexOf(this.currentGuess[i]) >= 0) {
          responseArray[i] = '2';
          remainingLetters.splice(remainingLetters.indexOf(this.currentGuess[i]), 1);
        }
      }

      return responseArray.join("");
    },
    resetGame: function() {
      this.currentGuess = '';
      this.guesses = [];
      this.results = {};
      this.yellowLetters = [];
      this.greenLetters = [];
      this.inputLocked = false;
      this.awaitingResult = false;
      this.victory = false;
      this.secretWord = this.randomWord();

      if (this.logAnswer) { console.log(this.secretWord); }
    },
    randomWord: function() {
      return DICTIONARY.wordList[Math.floor(Math.random()*DICTIONARY.wordList.length)].toUpperCase();
    }
  }
}
</script>

<style scoped>

</style>
