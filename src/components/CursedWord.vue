<template>
  <div class="cursed-word">
    <h1>CursedWord</h1>
    <GuessList :currentGuess="currentGuess" :guesses="guesses" />
    <Keyboard/>
  </div>
</template>

<script>
import GuessList from './GuessList.vue';
import Keyboard from './Keyboard.vue';

export default {
  name: 'CursedWord',
  components: {
    GuessList,
    Keyboard
  },
  props: {
    msg: String
  },
  data() {
    return {
      count: 1,
      currentGuess: [],
      guesses: [],
    }
  },
  mounted() {
    window.addEventListener("keydown", e => {
      let pressed = String.fromCharCode(e.keyCode);
      console.log(`Key pressed: ${pressed}} | Code: ${e.keyCode} | length: ${this.currentGuess.length}`);

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
    submitGuess: function() {
      this.guesses.push(this.currentGuess.join(" "));
      this.currentGuess = [];
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
