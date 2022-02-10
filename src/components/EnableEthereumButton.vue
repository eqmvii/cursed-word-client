<template>
  <button :disabled="disabled" class="enable-ethereum-button" @click="connect">Enable Ethereum</button>
</template>

<script>

// ethereumButton.addEventListener('click', () => {
//   //Will Start the metamask extension
//   ethereum.request({ method: 'eth_requestAccounts' });
// });

export default {
  name: 'GuessList',
  data() {
    return {
      disabled: false,
    }
  },
  methods: {
    // TODO EIRC: THIS
    connect: async function () {
      // TODO: check for window.ethereum
      this.disabled = true;
      console.log('connect to the blockchain UGH');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log(accounts);
    }
  }
}
</script>

<style scoped>

</style>
