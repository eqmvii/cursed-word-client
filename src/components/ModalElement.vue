<template>
  <div class="modal" :class="{ open: open }" @click="$emit('closeModal', $event)">
    <div class="modal-window">
      <span class="close" @click="$emit('closeModal', $event)">&times;</span>
      <br />
      <div class="modal-content">
        <slot></slot>
      </div>
      <br />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalElement',
  props: {
    open: Boolean,
  },
  methods: {}
}
</script>

<style scoped>

/* Modal inspiration from: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_modal */

.modal {
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  padding-top: 100px; /* Location of the box */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

.open {
  display: block;
}

.modal-window {
  background-color: #fefefe;
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 80%; /* Could be more or less, depending on screen size */
}

.modal-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

</style>
