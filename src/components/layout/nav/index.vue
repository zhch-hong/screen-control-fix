<template>
  <el-menu :default-active="$route.path" router>
    <NavItem v-for="(route, index) of routes" :route="route" :key="index" />
  </el-menu>
</template>
<script>
import { routes } from '@/router';
import NavItem from './NavItem.vue';

export default {
  components: {
    NavItem,
  },

  data() {
    return {
      routes,
    };
  },
};
</script>
