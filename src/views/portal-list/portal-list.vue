<template>
  <div>
    <vxe-toolbar perfect>
      <template #buttons>
        <el-button type="primary" @click="createMenhu">新增</el-button>
      </template>
    </vxe-toolbar>
    <vxe-table ref="xTable" :data="tableData">
      <vxe-table-column title="门户名称" field="portal_name"></vxe-table-column>
      <vxe-table-column title="门户关联菜单" field="portal_menu"></vxe-table-column>
      <vxe-table-column title="所属公司" field=""></vxe-table-column>
      <vxe-table-column title="是否启用" field="is_use" :formatter="enableFormat"></vxe-table-column>
      <vxe-table-column title="操作">
        <template #default="{ row }">
          <el-button size="mini" type="text">
            <router-link :to="'/preview-portal/' + row.uuid + '/' + space" #default="{ href }" custom>
              <a :href="href" target="_blank" style="text-decoration-line: unset">预览</a>
            </router-link>
          </el-button>
          <el-button v-if="row['is_use'] == 1" size="mini" type="text" @click="handleDisable(row)">禁用</el-button>
          <el-button v-if="row['is_use'] == 2" size="mini" type="text" @click="handleEnable(row)">停用</el-button>
          <el-button size="mini" type="text" @click="updateMenhu(row)">修改</el-button>
          <el-button size="mini" type="text" @click="handleDelete(row)">删除</el-button>
        </template>
      </vxe-table-column>
    </vxe-table>
    <vxe-pager
      perfect
      :current-page.sync="currentPage"
      :page-size.sync="pageSize"
      :total="totalResult"
      @page-change="fetchTableData"
    >
    </vxe-pager>
  </div>
</template>
<script>
import _ from 'lodash';
import { deleteMenhu, menhuList, updateMenhu } from '@/network';

export default {
  data() {
    return {
      tableData: [],
      space: 20,
      currentPage: 1,
      pageSize: 20,
      totalResult: 0,
    };
  },

  created() {
    this.fetchTableData();
  },

  methods: {
    /**
     * 请求门户列表
     */
    fetchTableData() {
      menhuList({ '~table~': 'lx_sys_portals', pagesize: this.pageSize, cpage: this.currentPage })
        .then((response) => {
          const { data } = response;
          console.log(data);
          if (data.code == 200) {
            this.tableData = data.data;
            this.totalResult = data.totalCount;
          } else {
            this.$message.warning(data.msg);
          }
        })
        .catch(({ message }) => {
          this.$error(message);
        });
    },

    /**
     * 禁用门户
     */
    handleDisable(row) {
      row = _.cloneDeep(row);
      row['is_use'] = '2';
      updateMenhu(row)
        .then((response) => {
          const { data } = response;

          if (data.code == 200) {
            console.log(data.data);
          } else {
            this.$message.warning(data.msg);
          }
        })
        .catch((error) => {
          console.warn(error.message);
        });
    },

    /**
     * 启用门户
     */
    handleEnable(row) {
      row = _.cloneDeep(row);
      row['is_use'] = '1';
      updateMenhu(row)
        .then((response) => {
          const { data } = response;

          if (data.code == 200) {
            console.log(data.data);
          } else {
            this.$message.warning(data.msg);
          }
        })
        .catch((error) => {
          console.warn(error.message);
        });
    },

    createMenhu() {
      this.$router.push('/update-portal/create');
    },

    /**
     * 更新门户
     */
    updateMenhu({ uuid }) {
      this.$router.push(`/update-portal/update/${uuid}`);
    },

    /**
     * 删除门户
     */
    handleDelete({ uuid }) {
      deleteMenhu({ '~table~': 'lx_sys_portals', uuid })
        .then(({ data }) => {
          if (data.code == 200) {
            this.fetchTableData();
          } else {
            this.$message.warning(data.msg);
          }
        })
        .catch(({ message }) => {
          console.warn(message);
        });
    },

    /**
     * 单元格格式化 启用/停用
     */
    enableFormat({ cellValue }) {
      if (cellValue == 1) return '启用';
      if (cellValue == 2) return '停用';
      return cellValue;
    },
  },
};
</script>
