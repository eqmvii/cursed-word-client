<template>
  <div v-if="showButton">
    <button :disabled="disabled" class="enable-ethereum-button" @click="connect">Enable Ethereum</button>
    <p v-if="errorText" class="error-text">{{ this.errorText }}</p>
  </div>
</template>

<script>
export default {
  name: 'EnableEthereumButton',
  data() {
    return {
      disabled: false,
      errorText: null,
      showButton: false
    }
  },
  methods: {
    connect: async function () {
      this.disabled = true;
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts && accounts.length > 0) {
        this.$emit('metamaskConnected');
        this.showButton = false;
      } else {
        this.errorText = "Something went wrong.";
        this.disabled = false;
      }
    }
  },
  mounted () {
    if (typeof window.ethereum !== 'undefined' && !window.ethereum.selectedAddress) {
      this.showButton = true;
    } else if (typeof window.ethereum !== 'undefined') {
      // We're allready connected
      this.$emit('metamaskConnected');
    } else {
      this.disabled = true;
      this.errorText = "Install MetaMask browser extension to connect to Cursed Word"
    }
  }
}
</script>

<style scoped>

   /* Styles match MetaMask example */
  .enable-ethereum-button {
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

  .enable-ethereum-button:disabled {
    cursor: wait;
    background-color: grey;
    box-shadow: 0 1px 2px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12);
  }

  .error-text {
    color: tomato;
  }

</style>
