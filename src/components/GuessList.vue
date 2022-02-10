<template>
  <div class="guess-list">
    <h1 v-for="oldGuess in guesses" :key="oldGuess" v-html="colorCode(oldGuess)">
    </h1>
    <h1 v-if="currentGuess.length > 0">{{ currentGuess.join(" ") }} {{ extraUnderscores }} </h1>
    <h1 v-else>_ _ _ _ _</h1>
  </div>
</template>

<script>

export default {
  name: 'GuessList',
  props: {
    currentGuess: {
      type: Array,
      default: () => [" "],
    },
    guesses: Array,
    results: Object
  },
  computed: {
    // TODO EIRC: THIS
    extraUnderscores: function () {
      // not implemented in IE oh well
      return "_ ".repeat(5 - this.currentGuess.length);
    }
  },
  methods: {
    colorCode(guess) {
      // return "choom";
      // // eslint-disable-next-line
      console.log(this.results);
      console.log(guess);
      const guessString = guess.replace(/\s/g, '').toLowerCase();
      console.log(guessString);
      if (!this.results[guessString]) { return guess; }
      let colorCodedString = "";
      const correctSpan = '<span style="color: Green; border-bottom: 2px solid Green">';
      const yellowSpan = '<span style="color: DarkGoldenRod; border-bottom: 2px solid DarkGoldenRod">';
      const closeSpan = '</span>';


      const result = `${this.results[guessString]}`;

      console.log('I see the result as: ' + result);

      for (let i = 0; i < guessString.length; i++) {
        console.log(i);
        console.log(result[i]);
        if (result[i] === '3') {
          colorCodedString += correctSpan;
          colorCodedString += guessString[i].toUpperCase();
          colorCodedString += closeSpan;
          colorCodedString += " ";
        } else if (result[i] === '2') {
          colorCodedString += yellowSpan;
          colorCodedString += guessString[i].toUpperCase();
          colorCodedString += closeSpan;
          colorCodedString += " ";
        } else {
          colorCodedString += guessString[i].toUpperCase();
          colorCodedString += " ";
        }
        console.log(colorCodedString);
      }

      return colorCodedString;
    }
  }
}
</script>

<style scoped>

  .guess-list {
    font-family: 'Courier New', monospace;
  }

</style>
