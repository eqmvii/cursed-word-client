<template>
  <button :disabled="disabled" class="enable-ethereum-button" @click="connect">Enable Ethereum</button>
</template>

<script>
export default {
  name: 'GuessList',
  data() {
    return {
      disabled: false,
    }
  },
  methods: {
    connect: async function () {
      // TODO: check for window.ethereum
      this.disabled = true;
      console.log('connect to the blockchain UGH');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log(accounts);

      // TODO: Emit connected to enable guessing?
    }
  },
  async mounted () {
    // TODO: safety for no metamask
    // TODO: disable or hide entirely if user is already connected?
    console.log('enable button mounting. Connected? ' + window.ethereum.isConnected());
  }
}
</script>

<style scoped>

</style>
