<template>
  <el-scrollbar
    ref="ElScrollbar"
    style="height: 100vh; background-color: #f2f2f2"
    wrapStyle="height: 100%; overflow-x: hidden;"
  >
    <div ref="preview" class="preview" :style="{ height, 'background-image': `url(${backgroundImage})` }"></div>
  </el-scrollbar>
</template>
<script>
import Vue from 'vue';
import { menhuData } from '@/network';
import backgroundImage from '@/asseats/Snipaste_2021-05-17_20-52-22.png';
import RenderWrap from './RenderWrap.vue';
import LanmuItem from './LanmuItem.vue';

// eslint-disable-next-line no-unused-vars
let localSpace = 20;
let colCount = 20;

function getBorderLength() {
  return (document.documentElement.clientWidth - localSpace * (colCount + 1)) / colCount;
}

export default {
  name: 'preview-portal',

  data() {
    console.log('data');

    return {
      instanceList: new Map(),
      uuid: '',
      height: '',
      borderLength: getBorderLength(),
      lanmuList: [],
      backgroundImage: backgroundImage,
    };
  },

  beforeRouteEnter(to, from, next) {
    const { space } = to.params;

    localSpace = space ? parseInt(space) : localSpace;

    next();
  },

  mounted() {
    const { uuid } = this.$route.params;
    this.uuid = uuid;
    this.fetchMenhuData();

    // 监听布局元素的大小变化，重新计算布局及布局中的栏目元素
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect) {
          // 重新计算各个参数值
          this.borderLength = getBorderLength();
          const maxY = Math.max(...this.lanmuList.map((item) => item.page_right_botton_Y));
          this.height = maxY * this.borderLength + localSpace * maxY + localSpace + 'px';

          // 重新设置栏目的位置大小
          this.instanceList.forEach((lm, instance) => {
            this.setAddress(instance, lm);
          });

          // 更新滚动条
          this.$nextTick(() => {
            this.$refs.ElScrollbar.update();
          });
        }
      }
    });

    this.$nextTick(() => {
      resizeObserver.observe(this.$refs.preview);
    });
  },

  methods: {
    fetchMenhuData() {
      const { uuid } = this.$route.params;

      menhuData({ '~table~': 'lx_sys_portals', uuid }).then(({ data }) => {
        if (data.code == 200) {
          console.log('门户数据', data);

          if (data.data.background_img) {
            this.backgroundImage = data.data.background_img;
          }

          this.lanmuList = data.lx_sys_portals_sub;
          this.refreshLayout();
        } else {
          this.$message.warning(data.msg);
        }
      });
    },

    /**
     * 页面布局
     */
    refreshLayout() {
      // 设置页面高度
      const maxY = Math.max(...this.lanmuList.map((item) => item.page_right_botton_Y));
      this.height = maxY * this.borderLength + localSpace * maxY + localSpace + 'px';

      const preview = this.$refs.preview;

      // 遍历添加门户栏目
      this.lanmuList.forEach((lm, index) => {
        const div = document.createElement('div');
        preview.append(div);

        const subclass = Vue.extend(LanmuItem);
        const instance = new subclass();
        instance.$mount(div);

        this.instanceList.set(instance, lm);

        this.setAddress(instance, lm);
        this.setLanmuData(instance, lm);

        const mountElement = instance.getMountElement();
        const renderWrapClass = Vue.extend(RenderWrap);
        const renderWrapInstance = new renderWrapClass();

        // 这个地方需要后端返回的link_address字段进行赋值
        if (index % 2 === 0) renderWrapInstance.path = '/OneCom';
        // renderWrapInstance.path = lm.link_address;
        // lm.link_address
        else renderWrapInstance.path = '/TwoCom'; // 这一行也不需要了
        renderWrapInstance.$mount(mountElement);
      });
    },

    /**
     * 设置栏目位置和宽高
     */
    setAddress(instance, { page_left_top_X, page_left_top_Y, page_right_botton_X, page_right_botton_Y }) {
      const s = instance.containerObservableStyle;

      instance.$set(s, 'top', (page_left_top_Y - 1) * this.borderLength + localSpace * page_left_top_Y + 'px');
      instance.$set(s, 'left', (page_left_top_X - 1) * this.borderLength + localSpace * page_left_top_X + 'px');
      instance.$set(
        s,
        'width',
        (page_right_botton_X - page_left_top_X + 1) * this.borderLength +
          localSpace * (page_right_botton_X - page_left_top_X) +
          'px'
      );
      instance.$set(
        s,
        'height',
        (page_right_botton_Y - page_left_top_Y + 1) * this.borderLength +
          localSpace * (page_right_botton_Y - page_left_top_Y) +
          'px'
      );
    },

    /**
     * 栏目附属数据
     */
    setLanmuData(
      instance,
      {
        page_name = '获取栏目名称失败',
        page_type = '',
        is_use = '',
        is_refresh_button = '',
        is_show_underline = '',
        is_more_button = '',
        is_add_button = '',
        is_show_title = '',
        new_url = '',
        click_view_more = '',
      }
    ) {
      const l = instance.lanmu;

      instance.$set(l, 'pageName', page_name);
      instance.$set(l, 'pageType', page_type);
      instance.$set(l, 'isUse', is_use);
      instance.$set(l, 'isRefreshButton', is_refresh_button);
      instance.$set(l, 'isShowUnderline', is_show_underline);
      instance.$set(l, 'isMoreButton', is_more_button);
      instance.$set(l, 'isAddButton', is_add_button);
      instance.$set(l, 'isShowTitle', is_show_title);
      instance.$set(l, 'newUrl', new_url);
      instance.$set(l, 'clickViewMore', click_view_more);
    },
  },
};
</script>
<style lang="scss" scoped>
div.preview {
  position: relative;
  min-height: 100vh;
  background-attachment: scroll;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}
</style>
