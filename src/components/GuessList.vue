<template>
  <div class="guess-list">
    <h1 v-for="oldGuess in guesses" :key="oldGuess" v-html="colorCode(oldGuess)">
    </h1>
    <h1 v-if="currentGuess.length > 0">{{ spacify(currentGuess) }} {{ extraUnderscores }} </h1>
    <h1 v-else-if="!won">_ _ _ _ _</h1>
  </div>
</template>

<script>

export default {
  name: 'GuessList',
  props: {
    currentGuess: String,
    guesses: Array,
    results: Object,
    won: Boolean
  },
  computed: {
    extraUnderscores: function () {
      // repeat is not implemented in IE oh well
      return "_ ".repeat(5 - this.currentGuess.length);
    }
  },
  methods: {
    colorCode(guess) {
      if (!this.results[guess]) { return guess; }

      let colorCodedString = "";
      const correctSpan = '<span style="color: rgb(26, 127, 55);; border-bottom: 2px solid rgb(26, 127, 55);">';
      const yellowSpan = '<span style="color: DarkGoldenRod; border-bottom: 2px solid DarkGoldenRod">';
      const greySpan = '<span style="color: Grey; font-weight: normal;">';
      const closeSpan = '</span>';


      const result = `${this.results[guess]}`;


      for (let i = 0; i < guess.length; i++) {
        if (result[i] === '3') {
          colorCodedString += correctSpan;
          colorCodedString += guess[i];
          colorCodedString += closeSpan;
          colorCodedString += " ";
        } else if (result[i] === '2') {
          colorCodedString += yellowSpan;
          colorCodedString += guess[i];
          colorCodedString += closeSpan;
          colorCodedString += " ";
        } else {
          colorCodedString += greySpan;
          colorCodedString += guess[i];
          colorCodedString += closeSpan;
          colorCodedString += " ";
        }
        // console.log(colorCodedString);
      }

      return colorCodedString;
    },
    spacify(word) {
      let spacedWord = '';

      for(let i = 0; i < word.length; i++) {
        spacedWord += word[i];
        spacedWord += ' ';
      }

      return spacedWord;
    }
  }
}
</script>

<style scoped>

  .guess-list {
    font-family: 'Courier New', monospace;
  }

</style>
