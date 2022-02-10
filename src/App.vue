<template>
  <CursedWord />
</template>

<script>
import CursedWord from './components/CursedWord.vue';

export default {
  name: 'App',
  components: {
    CursedWord
  },
}
</script>


<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;

  /* Make it nice and flex boxy */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
