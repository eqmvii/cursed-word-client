<template>
  <div class="trophy-list">
    <ul class="trophy-list__list">
      <li
        class="trophy-list__item"
        v-for="token in trophies"
        :key="token.id"
      >
        <button class="trophy-list__button" @click="$emit('openModal', token.id)">
          Word {{ token.id }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script>

export default {
  name: 'TrophyList',
  components: {},
  props: {
    trophies: Array
  },
}
</script>

<style scoped>

.trophy-list {
  padding: 0 150px;
}

.trophy-list__list {
  margin: 0;
  padding: 0;
}

.trophy-list__item {
  list-style-type: none;
  display: inline;

  padding: 8px;
}

.trophy-list__button {
  width: 130px;

  background-color: #037dd6;
  border: none;
  color: #fff;
  padding: 15px 32px;
  margin: 16px 8px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12);
  cursor: pointer;
}

</style>
