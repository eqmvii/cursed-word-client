<template>
  <div class="guess-list">
    <h1 v-for="oldGuess in guesses" :key="oldGuess" v-html="colorCode(oldGuess)">
    </h1>
    <h1 v-if="currentGuess.length > 0">{{ spacify(currentGuess) }} {{ extraUnderscores }}&nbsp;</h1>
    <h1 v-else-if="!won">_ _ _ _ _&nbsp;</h1>
  </div>
</template>

<script>

export default {
  name: 'GuessList',
  props: {
    currentGuess: String,
    guesses: Array,
    otherPlayerGuesses: Array,
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

      // eslint-disable-next-line
      let isNotMine = this.otherPlayerGuesses.includes(guess);

      // let colorCodedString = `<span ${this.otherPlayerGuesses.includes(guess) ? 'style="border: 1px solid black"' : ''}>`;
      let colorCodedString = '<span>';
      const correctSpan = '<span style="color: rgb(3, 174, 0);; border-bottom: 2px solid rgb(3, 174, 0);">';
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

      return colorCodedString + `${isNotMine ? '*' : '&nbsp;' }</span>`;
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
