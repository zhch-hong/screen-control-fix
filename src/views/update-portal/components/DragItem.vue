<template>
  <div
    class="drag"
    draggable="true"
    :data-start="startAddress"
    :data-end="endAddress"
    :data-uuid="dataUUID"
    :data-page_uuid="dataPageUUID"
    :style="{
      borderStyle,
      top: status.top + 'px',
      left: status.left + 'px',
      width: status.width + 'px',
      height: status.height + 'px',
    }"
    @dragstart="ondragstart"
    @dragend="ondragend"
  >
    <i class="el-icon-delete delete" title="删除栏目" @click="$emit('remove')"></i>
    <div class="name">{{ dragName }}</div>
    <div class="horizontal" @mousedown.self.left.prevent.stop="resizeHeight"></div>
    <div class="vertical" @mousedown.self.left.prevent.stop="resizeWidth"></div>
  </div>
</template>
<script>
/* eslint-disable no-unused-vars */

const UNRELATED = {
  offsetX: 0,
  offsetY: 0,
};

/**
 * 拖动前的位置和宽高
 */
const beforeDragAddress = {
  start: '',
  end: '',
  top: '',
  left: '',
  width: '',
  height: '',
};

export default {
  data() {
    return {
      dragName: '',
      dragRect: null,
      startAddress: '',
      endAddress: '',
      dataUUID: '',
      dataPageUUID: '',
      borderStyle: 'solid',
      status: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
      /**
       * 拖动鼠标时，鼠标的视窗位置
       */
      client: {
        x: 0,
        y: 0,
      },
    };
  },

  mounted() {
    this.refreshAddress();
  },

  methods: {
    /**
     * 根据栏目坐标重新设置栏目的top left width height
     * 用于布局元素改变大小后调用
     */
    resetByAddress() {
      const layoutRect = this.$el.parentElement.getBoundingClientRect();

      const lx = this.startAddress.split('-')[0];
      const ly = this.startAddress.split('-')[1];
      const rx = this.endAddress.split('-')[0];
      const ry = this.endAddress.split('-')[1];

      const startLi = this.getElement('REF_' + ly + '_' + lx);
      const endLi = this.getElement('REF_' + ry + '_' + rx);
      const startRect = startLi.getBoundingClientRect();
      const endRect = endLi.getBoundingClientRect();

      this.status.top = startRect.top - layoutRect.top + this.scrollTop.value;
      this.status.left = startRect.left - layoutRect.left;
      this.status.width = endRect.right - startRect.left;
      this.status.height = endRect.bottom - startRect.top;
    },

    /**
     * 设置的top和left，只用于更新门户，因为只有更新门户，才会自带栏目数据
     * 如果栏目初始化已经有位置坐标，则设置位置坐标
     *
     * 通过坐标获取所在li元素，然后用li元素的视窗宽高减去已经占据的宽高
     * 得到的就是栏目的top和left
     */
    refreshAddress() {
      if (this.dragRect) {
        const top = this.dragRect.top,
          left = this.dragRect.left;
        const li = this.getElement('REF_' + top + '_' + left);
        const layout = li.parentElement.parentElement;
        const liRect = li.getBoundingClientRect();
        const layoutRect = layout.getBoundingClientRect();
        const styleTop = liRect.top - layoutRect.top;
        const styleLeft = liRect.left - layoutRect.left;
        this.status.top = styleTop + this.scrollTop.value;
        this.status.left = styleLeft;

        this.refreshSize(styleTop, styleLeft, this.dragRect.bottom, this.dragRect.right);
      }
    },

    /**
     * 当栏目改变位置和宽高时修改对应的属性
     *
     * 使用右下角的坐标获取对应的li元素
     * 用li元素的视窗宽高减去布局的视窗宽高，再减去栏目的top和left，得到的就是栏目的宽高
     */
    refreshSize(top, left, bottom, right) {
      const li = this.getElement('REF_' + bottom + '_' + right);
      const layout = li.parentElement.parentElement;
      const liRect = li.getBoundingClientRect();
      const layoutRect = layout.getBoundingClientRect();
      const styleHeight = liRect.bottom - layoutRect.top - top;
      const styleWidth = liRect.right - layoutRect.left - left;

      this.status.width = styleWidth;
      this.status.height = styleHeight;

      this.setAddressData();
    },

    /**
     * 重置当前栏目到上一次的状态
     * 用于拖动结束时与其他栏目发生交错的情况下还原到之前的状态
     */
    async resetToPre() {
      this.startAddress = beforeDragAddress.start;
      this.endAddress = beforeDragAddress.end;
      this.status.top = beforeDragAddress.top;
      this.status.left = beforeDragAddress.left;
      this.status.width = beforeDragAddress.width;
      this.status.height = beforeDragAddress.height;

      await this.$nextTick();

      this.$emit('dragend', [this.startAddress, this.endAddress]);
    },

    /**
     * 缓存拖动或改变大小前的位置
     */
    cacheAddress() {
      beforeDragAddress.start = this.startAddress;
      beforeDragAddress.end = this.endAddress;
      beforeDragAddress.top = this.status.top;
      beforeDragAddress.left = this.status.left;
      beforeDragAddress.width = this.status.width;
      beforeDragAddress.height = this.status.height;
    },

    /**
     * 拖动开始时
     *
     * 记录鼠标相对于栏目左上角的偏移量
     * 缓存拖动前的位置
     */
    ondragstart(e) {
      this.borderStyle = 'dashed';

      UNRELATED.offsetX = e.offsetX;
      UNRELATED.offsetY = e.offsetY;

      this.cacheAddress(e);
    },

    /**
     * 已经存在于布局区域的栏目块拖动结束
     *
     * top值为鼠标相对于视窗的高加上滚动的高度减去鼠标位置偏移高再减去已被门户基础信息占据的高
     * left值为鼠标相对于视窗的宽减去鼠标位置偏移宽再减去门户基础信息占据的宽
     *
     * 根据top和left值计算出所在li元素，然后计算处栏目的top和left值
     */
    async ondragend(e) {
      this.borderStyle = 'solid';

      const layoutRect = this.$el.parentElement.getBoundingClientRect();

      const top = this.client.y + this.scrollTop.value - UNRELATED.offsetY - this.consumedHeight;
      const left = this.client.x - layoutRect.left - UNRELATED.offsetX;
      const len = this.border.value + this.margin.value;
      const row = top / len;
      const col = left / len;

      const li = this.getElement('REF_' + Math.ceil(row) + '_' + Math.ceil(col));

      if (!li) return;

      const rect = li.getBoundingClientRect();

      this.status.left = rect.left - layoutRect.left;
      this.status.top = rect.top + this.scrollTop.value - this.consumedHeight;

      this.setAddressData();
      this.overflowXFix();

      await this.$nextTick();

      // 将位置信息提交到父级组件进行判断是否与其他栏目交错
      this.$emit('dragend', [this.startAddress, this.endAddress]);
    },

    /**
     * 设置栏目的左上角坐标和右下角坐标
     */
    setAddressData() {
      const sx = Math.ceil(this.status.left / (this.border.value + this.margin.value));
      const sy = Math.ceil(this.status.top / (this.border.value + this.margin.value));
      this.startAddress = `${sx}-${sy}`;

      const ex = Math.round((this.status.left + this.status.width) / (this.border.value + this.margin.value));
      const ey = Math.round((this.status.top + this.status.height) / (this.border.value + this.margin.value));
      this.endAddress = `${ex}-${ey}`;
    },

    /**
     * 判断元素是否超出右边界
     * 如果宽度超出了右边界，则将缩减宽度至最右边，20
     */
    overflowXFix() {
      let lx = this.startAddress.split('-')[0];
      let rx = this.endAddress.split('-')[0];

      if (rx > 20) {
        const rby = this.endAddress.split('-')[1];
        const w = (20 - lx + 1) * this.border.value + (20 - lx) * this.margin.value;
        this.status.width = w;
        this.endAddress = `${20}-${rby}`;
      }
    },

    /**
     * 改变宽度
     */
    resizeWidth() {
      this.cacheAddress();

      this.borderStyle = 'dashed';

      const layoutRect = this.$el.parentElement.getBoundingClientRect();

      const left = this.status.left;
      const ul = this.$el.parentElement.querySelector('ul.back');
      const space = (ul.clientWidth - ul.childElementCount * this.border.value) / (ul.childElementCount + 1);
      const width = space + this.border.value;

      const handler = (e) => {
        // 宽度不能小于一个方格
        if (e.clientX - left - layoutRect.left < this.border.value) return;

        this.status.width = e.clientX - left - layoutRect.left;
      };

      document.addEventListener('mousemove', handler);

      document.addEventListener(
        'mouseup',
        (e) => {
          this.borderStyle = 'solid';
          // 计算宽度
          this.status.width = Math.ceil((e.clientX - layoutRect.left) / width) * width - left;

          document.removeEventListener('mousemove', handler);
          this.setAddressData();
          this.$nextTick(() => {
            this.$emit('dragend', [this.startAddress, this.endAddress]);
          });
        },
        { once: true }
      );
    },

    /**
     * 改变高度
     */
    resizeHeight() {
      this.cacheAddress();

      this.borderStyle = 'dashed';

      const handler = (e) => {
        if (e.clientY + this.scrollTop.value - this.status.top - this.consumedHeight < this.border.value) return;
        this.status.height = e.clientY + this.scrollTop.value - this.status.top - this.consumedHeight;
      };

      document.addEventListener('mousemove', handler);

      document.addEventListener(
        'mouseup',
        (e) => {
          this.borderStyle = 'solid';

          // 计算高度
          const _h = this.border.value + this.margin.value;
          const _d =
            Math.ceil((e.clientY - this.consumedHeight + this.scrollTop.value) / _h) * _h -
            (this.status.top + this.status.height);
          this.status.height = this.status.height + _d;

          document.removeEventListener('mousemove', handler);

          this.setAddressData();
          this.$nextTick(() => {
            this.$emit('dragend', [this.startAddress, this.endAddress]);
          });
        },
        { once: true }
      );
    },
  },
};
</script>
<style lang="scss" scoped>
div.drag {
  position: absolute;
  cursor: move;
  top: 0;
  left: 0;
  width: 86px;
  height: 86px;
  text-align: center;
  color: #0066ff;
  font-size: 20px;
  font-weight: 600;
  opacity: 0.3;
  background-color: #66a3ff;
  box-sizing: border-box;
  border: 2px #000a1a;

  i.delete {
    position: absolute;
    top: 4px;
    right: 4px;
    cursor: pointer;
    &:hover {
      color: #001433;
    }
  }

  div.vertical,
  div.horizontal {
    position: absolute;
    z-index: 2;
  }
  div.vertical {
    right: 0;
    top: 0;
    height: 100%;
    width: 10px;
    cursor: ew-resize;
  }
  div.horizontal {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 10px;
    cursor: ns-resize;
  }

  div.name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
