<template>
  <div v-if="!(route.meta && route.meta.hidden)">
    <!-- 没有子级菜单 -->
    <el-menu-item v-if="!route.children" :index="resolvePath(prePath, route.path)">
      <i v-if="route.meta && route.meta.icon" :class="route.meta.icon"></i>
      <template #title>{{ route.name }}</template>
    </el-menu-item>
    <!-- 只有一个子级菜单 -->
    <NavItem
      v-else-if="route.children.length === 1"
      :route="route.children[0]"
      :pre-path="resolvePath(prePath, route.path)"
    />
    <!-- 有一个以上子级菜单 -->
    <el-submenu v-else>
      <template #title>
        <i v-if="route.meta && route.meta.icon" :class="route.meta.icon"></i>
        <span>{{ route.name }}</span>
      </template>

      <NavItem
        v-for="(child, index) in route.children"
        :key="index"
        :route="child"
        :pre-path="resolvePath(prePath, route.path)"
      />
    </el-submenu>
  </div>
</template>

<script>
import path from 'path';

export default {
  name: 'NavItem',

  props: ['route', 'prePath'],

  methods: {
    resolvePath(prePath = '', routePath = '') {
      return path.resolve(prePath, routePath);
    },
  },
};
</script>
