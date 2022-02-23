<template>
  <div class="keyboard">
    <br />
    <hr />
    <div class="row">
      <br />
      <span v-for="letter in rowOne" :key="letter">
        <span :class="letterClass(letter)">{{ letter }}</span>&nbsp;
      </span>
    </div>
    <div class="row">
      <span v-for="letter in rowTwo" :key="letter">
        <span :class="letterClass(letter)">{{ letter }}</span>&nbsp;
      </span>
    </div>
    <div class="row">
      <span v-for="letter in rowThree" :key="letter">
        <span :class="letterClass(letter)">{{ letter }}</span>&nbsp;
      </span>
    </div>
  <br />
  <hr />
  </div>
</template>

<script>
export default {
  name: 'KeyboardElement',
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
      return this.guesses.map(g => g.guess).join('');
    }
  },
  methods: {
    letterClass(letter) {
      if (this.greenLetters.includes(letter)) {
        return 'green-letter';
      }

      if (this.yellowLetters.includes(letter)) {
        return 'yellow-letter';
      }

      if (this.allGuessedLetters.includes(letter)) {
        return 'taken-letter';
      }

      return '';
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

.green-letter {
  color: rgb(3, 174, 0);
  border-bottom: 2px solid rgb(3, 174, 0);
  font-weight: 'bold';
}

.yellow-letter {
  color: DarkGoldenRod;
  border-bottom: 2px solid DarkGoldenRod;
  font-weight: 'bold';
}

.taken-letter {
  font-weight: normal;
  color: LightGrey;
}

</style>
