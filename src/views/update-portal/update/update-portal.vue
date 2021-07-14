<template>
  <div class="page-list">
    <div class="layout-item">
      <h4>列表栏目</h4>
      <div class="item-list">
        <div
          v-for="item of lanmuList"
          :key="item.uuid"
          :data-uuid="item.uuid"
          data-type="1"
          class="item"
          draggable="true"
          @dragend="onItemDragend"
        >
          <span>
            {{ item.page_name }}
          </span>
        </div>
      </div>
      <h4>链接栏目</h4>
      <div class="item-list">
        <div
          v-for="item of lanmuHref"
          :key="item.uuid"
          :data-uuid="item.uuid"
          data-type="2"
          class="item"
          draggable="true"
          @dragend="onItemDragend"
        >
          <span>
            {{ item.page_name }}
          </span>
        </div>
      </div>
      <h4>图表栏目</h4>
      <div class="item-list">
        <div
          v-for="item of lanmuChart"
          :key="item.uuid"
          :data-uuid="item.uuid"
          data-type="3"
          class="item"
          draggable="true"
          @dragend="onItemDragend"
        >
          <span>
            {{ item.page_name }}
          </span>
        </div>
      </div>
    </div>
    <div class="main-container">
      <PortalBase :data="portalBase" @submit="handleSubmit" />
      <div
        ref="LayoutPanel"
        class="layout-panel"
        @drop="ondrop"
        @dragover="ondragover"
        @scroll.self.prevent.stop="(e) => (scrollTop.value = e.target.scrollTop)"
      >
        <ul v-for="indexul in 100" :key="indexul" class="back" :style="{ margin: `${margin.value}px 0` }">
          <li
            v-for="indexli in 20"
            :key="indexli"
            :ref="'REF_' + indexul + '_' + indexli"
            :style="{ width: border.value + 'px', height: border.value + 'px' }"
          ></li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash';
import DragItem from '../components/DragItem.vue';
import PortalBase from '../components/PortalBase.vue';
import { menhuData, updateMenhu, lanmuListByType } from '@/network';

// 布局时被占据的高度，等于门户基础信息所占的高度
const CONSUMED_HEIGHT = 180;

/**
 * 门户中栏目块的位置
 */
let dragendItemMap = {};

/**
 * 如果将门户中已有的栏目删除
 * 就添加到这个数组中，保存门户数据时，需要将这些数据传回去
 */
let removeAlreadyLanmu = [];

export default {
  name: 'update-portal',

  components: {
    PortalBase,
  },

  data() {
    return {
      instanceList: [],

      /** 小方块（li元素）的边长 */
      border: {
        value: 0,
      },
      /** 小方块的间隔 */
      margin: {
        value: 0,
      },
      /** 门户基础信息 */
      portalBase: null,
      /** 布局区域滚动的高度 */
      scrollTop: {
        value: 0,
      },
      /** 鼠标移动时相对于视窗的宽高值 */
      client: {
        x: 0,
        y: 0,
      },

      lanmuList: [],
      lanmuHref: [],
      lanmuChart: [],
    };
  },

  /**
   * 进入路由前，将栏目位置存储对象清空，一移除的栏目列表置空
   */
  beforeRouteEnter(to, from, next) {
    dragendItemMap = {};
    removeAlreadyLanmu = [];
    next();
  },

  created() {
    this.fetchLanmu();
    this.fetchMenhuData();
  },

  mounted() {
    // 监听布局元素的大小变化，重新计算布局及布局中的栏目元素
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect) {
          this.flushLayout(entry.contentRect.width);

          this.$nextTick(() => {
            this.instanceList.forEach((ins) => {
              if (ins) ins.resetByAddress();
            });
          });
        }
      }
    });

    resizeObserver.observe(this.$refs.LayoutPanel);
  },

  methods: {
    /**
     * 请求门户数据
     */
    fetchMenhuData() {
      const { uuid } = this.$route.params;
      const params = { '~table~': 'lx_sys_portals', uuid };
      menhuData(params)
        .then(({ data }) => {
          if (data.code == 200) {
            console.log('门户数据', data);
            this.portalBase = data.data;
            this.initDrag(data.lx_sys_portals_sub);
          } else {
            this.$message.warning(data.msg);
          }
        })
        .catch((error) => {
          console.warn(error.message);
        });
    },

    /**
     * 请求栏目数据，列表，图表，链接
     */
    fetchLanmu() {
      const listParams = { '~table~': 'lx_sys_pages', page_type: '1', pagesize: 20, cpage: 1 };
      lanmuListByType(listParams)
        .then(({ data }) => {
          console.log('列表', data);
          if (data.code == 200) {
            this.lanmuList = data.data.filter((m) => m['is_use'] == 1);
          } else {
            this.$message.warning(data.msg);
          }
        })
        .catch(({ message }) => {
          console.warn(message);
        });

      const hrefParams = { '~table~': 'lx_sys_pages', page_type: '2', pagesize: 20, cpage: 1 };
      lanmuListByType(hrefParams)
        .then(({ data }) => {
          console.log('链接', data);
          if (data.code == 200) {
            this.lanmuHref = data.data.filter((m) => m['is_use'] == 1);
          } else {
            this.$message.warning(data.msg);
          }
        })
        .catch(({ message }) => {
          console.warn(message);
        });

      const chartParams = { '~table~': 'lx_sys_pages', page_type: '3', pagesize: 20, cpage: 1 };
      lanmuListByType(chartParams)
        .then(({ data }) => {
          console.log('图表', data);
          if (data.code == 200) {
            this.lanmuChart = data.data.filter((m) => m['is_use'] == 1);
          } else {
            this.$message.warning(data.msg);
          }
        })
        .catch(({ message }) => {
          console.warn(message);
        });
    },

    /**
     * 计算每个小方块的边长和小方块的间隔
     *
     */
    flushLayout(width) {
      const border = Math.floor((width * 3.75) / 86);

      this.border.value = border;
      this.margin.value = Math.floor(border / 3.75 / 2);
    },

    /**
     * 拖动时记录鼠标相对于视窗的宽高值
     */
    ondrop(e) {
      e.preventDefault();

      this.client.x = e.clientX;
      this.client.y = e.clientY;
    },

    ondragover(e) {
      e.preventDefault();
    },

    /**
     * 获取布局区域某一个li元素
     * @param value ref值
     * @returns HTMLLiElement
     */
    getElement(value) {
      if (this.$refs[value]) return this.$refs[value][0];
    },

    /**
     * 当左边单个栏目拖动结束时的处理回调
     */
    async onItemDragend(e) {
      if (e.dataTransfer.dropEffect !== 'none') {
        // 栏目的page_uuid
        const uuid = e.target.getAttribute('data-uuid');

        if (dragendItemMap[uuid]) {
          this.$message.info('栏目重复添加');
          return;
        }

        // 计算出拖动到哪一个方块放置的
        const scrollY = this.$refs.LayoutPanel.scrollTop;
        const top = Math.ceil((this.client.y - CONSUMED_HEIGHT + scrollY) / (this.border.value + this.margin.value));
        const left = Math.ceil(
          (this.client.x - this.$refs.LayoutPanel.getBoundingClientRect().left) /
            (this.border.value + this.margin.value)
        );
        const right = left + 1;
        const bottom = top + 1;

        // 创建挂载元素
        const mountEl = document.createElement('div');
        this.$refs.LayoutPanel.append(mountEl);

        // 创建实例，并赋值一些必须的数据，然后挂载到DOM
        const Class = Vue.extend(DragItem);
        const instance = new Class();
        instance.getElement = this.getElement;
        instance.border = this.border;
        instance.dataPageUUID = uuid;
        instance.margin = this.margin;
        instance.consumedHeight = CONSUMED_HEIGHT;
        instance.scrollTop = this.scrollTop;
        instance.client = this.client;
        instance.$set(instance.$data, 'dragName', e.target.innerText);
        instance.$set(instance.$data, 'dragRect', {
          top,
          right,
          bottom,
          left,
        });
        instance.$mount(mountEl);

        dragendItemMap[uuid] = [`${left}-${top}`, `${right}-${bottom}`];

        // 拖动结束时判断栏目是否交错
        instance.$on('dragend', async (address) => {
          dragendItemMap[uuid] = address;

          await this.$nextTick();

          if (this.isIntersectionRect()) {
            this.$message.error('栏目交错');
            instance.resetToPre();
          }
        });

        // 删除栏目时，将栏目放置到删除的数组中
        instance.$on('remove', () => {
          instance.$el.remove();
          instance.$destroy();
          delete dragendItemMap[uuid];
        });

        await this.$nextTick();

        // 当从左边的栏目拖动区域拖动到右边的布局区域时，立刻判断是否栏目交错
        if (this.isIntersectionRect()) {
          this.$message.error('栏目交错');
          instance.$el.remove();
          instance.$destroy();
          delete dragendItemMap[uuid];
        }

        this.instanceList.push(instance);
      }
    },

    /**
     * 将门户中已有的栏目添加到布局区域
     * @param dragList 栏目列表
     */
    initDrag(dragList) {
      dragList.forEach((item) => {
        console.log('添加已有栏目', item);
        const mountEl = document.createElement('div');
        this.$refs.LayoutPanel.append(mountEl);

        const Class = Vue.extend(DragItem);
        const instance = new Class();
        instance.getElement = this.getElement;
        instance.border = this.border;
        instance.margin = this.margin;
        instance.dataUUID = item.uuid;
        instance.dataPageUUID = item.page_uuid;
        instance.consumedHeight = CONSUMED_HEIGHT;
        instance.scrollTop = this.scrollTop;
        instance.client = this.client;
        instance.$set(instance.$data, 'dragName', item.page_name || '获取栏目名称失败');
        instance.$set(instance.$data, 'dragRect', {
          top: item.page_left_top_Y,
          right: item.page_right_botton_X,
          bottom: item.page_right_botton_Y,
          left: item.page_left_top_X,
        });
        instance.$mount(mountEl);

        dragendItemMap[item.page_uuid] = [
          `${item.page_left_top_X}-${item.page_left_top_Y}`,
          `${item.page_right_botton_X}-${item.page_right_botton_Y}`,
        ];

        instance.$on('dragend', async (address) => {
          dragendItemMap[item.page_uuid] = address;

          await this.$nextTick();

          if (this.isIntersectionRect()) {
            this.$message.error('栏目交错');
            instance.resetToPre();
          }
        });

        instance.$on('remove', () => {
          const clone = _.cloneDeep(item);
          clone['~type~'] = 'del';
          removeAlreadyLanmu.push(clone);

          instance.$el.remove();
          instance.$destroy();
          delete dragendItemMap[item.page_uuid];
        });

        this.instanceList.push(instance);
      });
    },

    /**
     * 判断栏目之间是否存在交叉重叠
     *
     * 通过两两相交判断
     */
    isIntersectionRect() {
      const array = _.cloneDeep(Object.values(dragendItemMap));
      const intersection = (o, t) => {
        const osx = o[0].split('-')[0] * 1;
        const osy = o[0].split('-')[1] * 1;
        const oex = o[1].split('-')[0] * 1;
        const oey = o[1].split('-')[1] * 1;
        const tsx = t[0].split('-')[0] * 1;
        const tsy = t[0].split('-')[1] * 1;
        const tex = t[1].split('-')[0] * 1;
        const tey = t[1].split('-')[1] * 1;

        if (osx > tex || osy > tey || oex < tsx || oey < tsy) {
          return false;
        }

        return true;
      };
      const isFind = (source, target) => {
        let b = false;
        const i = target.findIndex((item) => {
          return intersection(source, item);
        });
        if (i !== -1) {
          b = true;
        } else {
          if (target.length > 0) {
            const s = target.shift();
            return isFind(s, target);
          }
        }

        return b;
      };
      const s = array.shift();
      return isFind(s, array);
    },

    /**
     * 保存
     */
    handleSubmit(portalBase) {
      const dataList = [];
      const _f = Number.parseFloat;

      // 获取所有布局区域的栏目
      const element = this.$refs.LayoutPanel;
      const nodeList = element.querySelectorAll('div.drag');
      nodeList.forEach((element) => {
        const start = element.getAttribute('data-start').split('-');
        const end = element.getAttribute('data-end').split('-');
        const uuid = element.getAttribute('data-uuid');
        const page_uuid = element.getAttribute('data-page_uuid');
        const data = {
          uuid,
          page_uuid,
          portals_uuid: this.portalBase.uuid,
          org_level_uuid: '',
          portal_person: '',
          page_left_top_X: _f(start[0]),
          page_left_top_Y: _f(start[1]),
          page_right_botton_X: _f(end[0]),
          page_right_botton_Y: _f(end[1]),
        };
        dataList.push(data);
      });

      dataList.push(...removeAlreadyLanmu);

      /** 栏目基础数据 */
      const params = {
        '~table~': 'lx_sys_portals',
        uuid: this.portalBase.uuid,
        portal_name: portalBase.portal_name,
        portal_menu: portalBase.portal_menu,
        portal_type: portalBase.portal_type,
        background_img: portalBase.background_img,
        is_use: this.portalBase.is_use,
        lx_sys_portals_sub: dataList,
      };

      updateMenhu(params)
        .then(({ data }) => {
          console.log('更新门户', JSON.parse(JSON.stringify(params)), data);
          if (data.code == 200) {
            this.$message.success(data.msg);
            this.$router.push('/');
          } else {
            this.$message.warning(data.msg);
          }
        })
        .catch(({ message }) => {
          this.$message.error(message);
        });
    },
  },
};
</script>
<style lang="scss" scoped>
div.page-list {
  height: 100%;
  display: flex;
}

div.layout-item {
  width: 180px;
  background-color: #f9f9f9;

  h4 {
    margin: 0.6em 5px;
  }

  div.item-list {
    div.item {
      position: relative;
      margin: 4px;
      width: 80px;
      height: 80px;
      background-color: rgba(64, 158, 255, 0.8);
      border-radius: 2px;
      display: inline-block;
      & > span {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 12px;
        color: white;
        white-space: nowrap;
      }
    }
  }
}

div.main-container {
  position: relative;
  flex-grow: 1;

  div.layout-panel {
    top: 180px;
    bottom: 0;
    width: 100%;
    position: absolute;
    overflow: auto;

    ul.back {
      margin: 0;
      padding: 0;
      display: flex;
      list-style: none;
      justify-content: space-evenly;

      li {
        background-color: #f2f2f2;
      }
    }
  }
}
</style>
