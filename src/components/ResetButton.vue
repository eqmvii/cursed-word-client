<template>
  <button class="reset-button" @click="$emit('reset')">Next Word</button>
</template>

<script>
export default {
  name: 'ResetButton',
}
</script>

<style scoped>

.reset-button {
  background-color: #037dd6;
  border: none;
  color: #fff;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12);
  cursor: pointer;
}

</style>
