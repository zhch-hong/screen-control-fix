<template>
  <el-dialog :visible.sync="visiblesync" :destroy-on-close="true" title="列表栏目">
    <el-form ref="elForm" :model="form" label-width="100px">
      <el-form-item label="栏目名称">
        <el-input v-model="form.page_name"></el-input>
      </el-form-item>
      <el-form-item label="数据源">
        <el-select v-model="form.data_source" @change="fetchColumnName">
          <el-option
            v-for="item of shujuyuanList"
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
  data_source: '',
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
  name: 'ListConfig',

  props: ['visible', 'config'],

  data() {
    return {
      form: _.cloneDeep(formModel),
      /** 数据源下拉框 */
      shujuyuanList: [],
      /** 显示列名下拉框 */
      columnNameList: [],
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
    this.fetchShujuyuan();
    this.fetchColumnName();
  },

  methods: {
    /**
     * 请求数据源
     */
    fetchShujuyuan() {
      hightFields('table_name').then(({ data }) => {
        console.log('数据源', data);
        if (data.code == 200) {
          this.shujuyuanList = data.data;
        } else {
          this.$message.warning(data.msg);
        }
      });
    },

    /**
     * 请求显示列名
     */
    fetchColumnName() {
      const params = {
        prompt_name: 'data_source_field',
        datasource_uuid: '0aae05ea-632c-42d3-9670-e8fc17a2b367',
      };

      // const result = this.shujuyuanList.find((item) => item.value_field === this.form.data_source);

      // if (result) {
      //   params.datasource_uuid = result.uuid;
      // }

      hightFields(params).then(({ data }) => {
        console.log('显示列名', data);
        if (data.code == 200) {
          this.columnNameList = data.data;
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
