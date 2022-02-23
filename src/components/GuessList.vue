<template>
  <div class="guess-list">
    <div v-for="oldGuess in guesses" :key="oldGuess" class="guessrow">
      <div class="left guesscol">
        <p>{{ guessAddress(oldGuess) }}</p>
      </div>
      <div class="center guesscol">
        <h1  v-html="colorCode(oldGuess.guess)" />
      </div>
      <div class="right guesscol">
        <div v-if="oldGuess.result === '33333'">🥇</div>
      </div>
    </div>
    <!-- <h1 v-for="oldGuess in guesses" :key="oldGuess" v-html="colorCode(oldGuess)">
    </h1> -->
    <div class="guessrow">
      <div class="left guesscol"></div>
      <div class="center guesscol">
        <h1 v-if="currentGuess.length > 0">{{ spacify(currentGuess) }} {{ extraUnderscores }}</h1>
        <h1 v-else-if="!won">_ _ _ _ _</h1>
      </div>
      <div class="right guesscol">
        <!-- TODO: implement <button>Submit!</button> -->
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'GuessList',
  props: {
    currentGuess: String,
    guesses: Array,
    won: Boolean,
    myAddress: String
  },
  computed: {
    extraUnderscores: function () {
      // repeat is not implemented in IE oh well
      return "_ ".repeat(5 - this.currentGuess.length);
    }
  },
  methods: {
    colorCode(guess) {
      // TODO ERIC: Refactor to work the way the keyboard does
      let colorCodedString = '<span>';
      const correctSpan = '<span style="color: rgb(3, 174, 0);; border-bottom: 2px solid rgb(3, 174, 0);">';
      const yellowSpan = '<span style="color: DarkGoldenRod; border-bottom: 2px solid DarkGoldenRod">';
      const greySpan = '<span style="color: Grey; font-weight: normal;">';
      const closeSpan = '</span>';

      const result = `${this.guesses.find(g => g.guess === guess).result}`;

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
    },
    guessAddress(guess) {
      if (guess.guesser && guess.guesser.toLowerCase() == this.myAddress.toLowerCase()) {
        return '';
      } else if (guess.guesser && guess.guesser) {
        return `from ${guess.guesser.substring(0, 5) }...${guess.guesser.slice(-4)}`;
      }

      return '';
    }
  }
}
</script>

<style scoped>

.guess-list {
  font-family: 'Courier New', monospace;

  width: 90%;
}

.guessrow {
  display: flex;
  align-items: center;
  justify-content: center;
}

.left {
  width: 30%;
  text-align: right;
}

.right {
  width: 30%;
  text-align: left;
}

.center {
  width: 35%;
}

</style>
