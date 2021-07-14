<template>
  <div
    class="container"
    :style="{
      top: containerObservableStyle.top,
      left: containerObservableStyle.left,
      width: containerObservableStyle.width,
      height: containerObservableStyle.height,
      'border-width': containerObservableStyle.borderWidth,
    }"
  >
    <div
      class="header"
      :style="{ height: headerHeight, 'border-bottom': lanmu.isShowUnderline == 1 ? '1px solid #f2f2f2' : '' }"
    >
      <!-- 标题 -->
      <div class="name">
        <span v-if="lanmu.isShowTitle == 1">{{ lanmu.pageName }}</span>
      </div>
      <!-- 按钮 -->
      <div class="button">
        <el-button
          v-if="lanmu.isRefreshButton == 1"
          type="text"
          icon="el-icon-refresh"
          title="刷新"
          @click="handleRefresh"
        ></el-button>
        <el-button
          v-if="lanmu.isAddButton == 1"
          type="text"
          icon="el-icon-plus"
          title="新增"
          @click="handleCreate"
        ></el-button>
        <el-button
          v-if="lanmu.isMoreButton == 1"
          type="text"
          icon="el-icon-more"
          title="更多"
          style="transform: rotate(90deg)"
          @click="handleMore"
        ></el-button>
      </div>
    </div>
    <div class="main" :style="{ height: mainHeight }">
      <!-- <el-scrollbar style="height: 100%" wrapStyle="height: 100%; overflow-x: hidden;"> -->
      <div ref="mountElement"></div>
      <!-- </el-scrollbar> -->
    </div>
  </div>
</template>
<script>
export default {
  name: 'LanmuItem',

  data() {
    return {
      headerHeight: '40px',
      containerObservableStyle: {
        top: '',
        left: '',
        width: '',
        height: '',
        borderWidth: '',
      },
      lanmu: {
        pageName: '',
        pageType: '',
        isUse: '',
        isRefreshButton: '',
        isShowUnderline: '',
        isMoreButton: '',
        isAddButton: '',
        isShowTitle: '',
        newUrl: '',
        clickViewMore: '',
      },
    };
  },

  computed: {
    mainHeight() {
      return (
        parseFloat(this.containerObservableStyle.height) -
        parseFloat(this.containerObservableStyle.borderWidth) * 2 -
        parseInt(this.headerHeight) +
        'px'
      );
    },
  },

  methods: {
    getMountElement() {
      return this.$refs.mountElement;
    },

    handleRefresh() {
      this.$message.info('你点击了刷新按钮');
    },

    handleCreate() {
      this.$message.info('你点击了新增按钮');
      if (this.lanmu.newUrl) {
        window.open(this.lanmu.newUrl);
      }
    },

    handleMore() {
      this.$message.info('你点击了更多按钮');
      if (this.lanmu.clickViewMore) {
        window.open(this.lanmu.clickViewMore);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.container {
  position: absolute;
  background-color: #fff;
  border-radius: 14px;
  overflow: hidden;

  .header {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .name {
      color: rgb(1, 166, 240);
      margin-left: 14px;
    }

    .button {
      margin-right: 14px;
    }
  }

  .main {
    overflow: hidden;
  }
}
</style>
