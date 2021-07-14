<template>
  <div class="container">
    <div class="nav">
      <Nav />
    </div>
    <div class="main">
      <router-view />
    </div>
  </div>
</template>
<script>
/* eslint-disable vue/no-unused-components */

import Nav from './nav/index.vue';

export default {
  components: {
    Nav,
  },
};
</script>
<style lang="scss" scoped>
div.container {
  height: 100vh;
  display: flex;
  div.nav {
    position: relative;
    width: 180px;
  }
  div.main {
    position: relative;
    flex-grow: 1;
    overflow: auto;
    box-shadow: 0 0 2px 1px #ecf5ff;
  }
}
</style>
