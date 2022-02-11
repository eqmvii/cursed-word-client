<template>
  <div class="keyboard">
    <br />
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
  </div>
</template>

<script>
export default {
  name: 'Keyboard',
  props: {
    guesses: Array,
    results: Object,
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
    guessedLetters: function() {
      if (!this.guesses) { return ""; }
      // no need to remove duplicates for our checking
      return this.guesses.join("").replace(/\s/g, '').toLowerCase();
    }
  },
  methods: {
    letterStyle(letter) {
      const taken = this.guessedLetters || "";
      let style = { color: "#2c3e5" };
      let lowerLetter = letter.toLowerCase();

      if (taken.includes(lowerLetter)) {
        style.color = "grey";
        style.fontWeight = "normal";
      }

      if (this.yellowLetters.includes(lowerLetter)) {
        style.color = "DarkGoldenRod";
        style.borderBottom = "2px solid DarkGoldenRod";
        style.fontWeight = "bold";
      }

      if (this.greenLetters.includes(lowerLetter)) {
        style.color = "Green";
        style.borderBottom = "2px solid Green";
        style.fontWeight = "bold";
      }

      return style;
    }
  }
}
</script>

<style scoped>

  .keyboard {
    font-weight: bold;
    font-size: 20px;
  }

  .row {
    margin-bottom: 6px;
  }

</style>
