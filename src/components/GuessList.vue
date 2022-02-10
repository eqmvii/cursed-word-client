<template>
  <div class="guess-list">
    <h1 v-for="oldGuess in guesses" :key="oldGuess">
      {{ oldGuess }}
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
  },
  computed: {
    // TODO EIRC: THIS
    extraUnderscores: function () {
      // not implemented in IE oh well
      return "_ ".repeat(5 - this.currentGuess.length);
    }
  }
}
</script>

<style scoped>

  .guess-list {
    font-family: 'Courier New', monospace;
  }

</style>
