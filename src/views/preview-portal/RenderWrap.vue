<template>
  <component :is="comp" />
</template>
<script>
export default {
  data() {
    return {
      comp: '',
      path: '',
    };
  },

  created() {
    this.comp = (resolve) => require(['@/views/system' + this.path + '.vue'], resolve);
  },
};
</script>
