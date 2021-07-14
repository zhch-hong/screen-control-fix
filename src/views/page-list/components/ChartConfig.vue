<template>
  <el-dialog :visible.sync="visiblesync" :destroy-on-close="true" title="图表栏目">
    <el-form ref="elForm" :model="form" label-width="100px">
      <el-form-item label="栏目名称">
        <el-input v-model="form.page_name"></el-input>
      </el-form-item>
      <el-form-item label="图表名称">
        <el-select v-model="form.chart_name">
          <el-option
            v-for="item of nameList"
            :key="item.value_field"
            :label="item.view_fields"
            :value="item.value_field"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-divider></el-divider>
    <div class="check-group">
      <div>
        <el-checkbox v-model="form.is_refresh_button" :true-label="1" :false-label="0">是否显示刷新按钮</el-checkbox>
      </div>
      <div>
        <el-checkbox v-model="form.is_show_underline" :true-label="1" :false-label="0"
          >是否显示默认标题下面的横线</el-checkbox
        >
      </div>
      <div>
        <el-checkbox v-model="form.is_more_button" :true-label="1" :false-label="0">是否显示更多按钮</el-checkbox>
        <el-input
          v-model="form.click_view_more"
          size="small"
          style="width: 25vw; margin-left: 2vw"
          placeholder="点击更多URL"
        ></el-input>
      </div>
      <div>
        <el-checkbox v-model="form.is_add_button" :true-label="1" :false-label="0">是否显示新增按钮</el-checkbox>
        <el-input
          v-model="form.new_url"
          size="small"
          style="width: 25vw; margin-left: 2vw"
          placeholder="点击新增URL"
        ></el-input>
      </div>
      <div>
        <el-checkbox v-model="form.is_show_title" :true-label="1" :false-label="0">是否显示标题</el-checkbox>
        <el-input
          v-model="form.title_name"
          size="small"
          style="width: 25vw; margin-left: 2vw"
          placeholder="标题名称"
        ></el-input>
      </div>
    </div>
    <template #footer>
      <el-button @click="visiblesync = false">取消</el-button>
      <el-button @click="$emit('submit', form)">确定</el-button>
    </template>
  </el-dialog>
</template>
<script>
import _ from 'lodash';
import { hightFields } from '@/network';

const formModel = {
  page_name: '',
  chart_name: '',
  is_refresh_button: 0,
  is_show_underline: 0,
  is_more_button: 0,
  click_view_more: '',
  is_add_button: 0,
  new_url: '',
  is_show_title: 0,
  title_name: '',
};

export default {
  name: 'LinkConfig',

  props: ['visible', 'config'],

  data() {
    return {
      form: _.cloneDeep(formModel),
      /** 图表名称下拉框 */
      nameList: [],
    };
  },

  computed: {
    visiblesync: {
      get() {
        return this.visible;
      },
      set(value) {
        this.$emit('update:visible', value);
      },
    },
  },

  watch: {
    config: {
      immediate: true,
      deep: true,
      handler(object) {
        if (object) {
          Object.assign(this.form, object);
        } else {
          this.form = _.cloneDeep(formModel);
        }
      },
    },
  },

  created() {
    this.fetchNameList();
  },

  methods: {
    fetchNameList() {
      hightFields('table_name').then(({ data }) => {
        if (data.code == 200) {
          this.nameList = data.data;
        } else {
          this.$message.warning(data.msg);
        }
      });
    },

    submit() {
      this.$emit('submit', this.form);
    },
  },
};
</script>
<style lang="scss" scoped>
.check-group {
  display: flex;
  flex-direction: column;
  & > div {
    margin: 10px 0;
  }
}
</style>
