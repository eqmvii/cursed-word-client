<template>
  <div class="keyboard">
    <br />
    <hr />
    <div class="row">
      <br />
      <span v-for="letter in rowOne" :key="letter">
        <span :style="letterStyle(letter)">{{ letter }}</span>&nbsp;
      </span>
    </div>
    <div class="row">
      <span v-for="letter in rowTwo" :key="letter">
        <span :style="letterStyle(letter)">{{ letter }}</span>&nbsp;
      </span>
    </div>
    <div class="row">
      <span v-for="letter in rowThree" :key="letter">
        <span :style="letterStyle(letter)">{{ letter }}</span>&nbsp;
      </span>
    </div>
  <br />
  <hr />
  </div>
</template>

<script>
export default {
  name: 'Keyboard',
  props: {
    guesses: Array,
    yellowLetters: Array,
    greenLetters: Array
  },
  data() {
    return {
      rowOne: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      rowTwo: ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      rowThree: ["Z", "X", "C", "V", "B", "N", "M"]
    }
  },
  computed: {
    allGuessedLetters: function() {
      if (!this.guesses) { return ""; }
      // no need to remove duplicates for our checking
      return this.guesses.map(g => g.guess).join("");
    }
  },
  methods: {
    // TODO: Refactor into components + classes for a letter, instead of dumb style tags
    letterStyle(letter) {
      const taken = this.allGuessedLetters || '';
      let style = { };

      if (taken.includes(letter)) {
        style.color = 'LightGrey';
        style.fontWeight = 'normal';
      }

      if (this.yellowLetters.includes(letter)) {
        style.color = 'DarkGoldenRod';
        style.borderBottom = '2px solid DarkGoldenRod';
        style.fontWeight = 'bold';
      }

      if (this.greenLetters.includes(letter)) {
        style.color = 'rgb(3, 174, 0)';
        style.borderBottom = '2px solid rgb(3, 174, 0)';
        style.fontWeight = 'bold';
      }

      return style;
    }
  }
}
</script>

<style scoped>

  .keyboard {
    font-weight: bold;
    font-size: 32px;
    font-family: 'Courier New', Courier, monospace;
  }

  .row {
    margin-bottom: 6px;
  }

</style>
