<template>
  <div class="container">
    <!--面包屑-->
    <Breadcrumb :items="['系统管理', '操作日志']"></Breadcrumb>
    <a-card
        class="general-card r-nav-card"
        :body-style="{ padding: '15px' }"
        :header-style="{ padding: '15px' }"
    >
      <a-row>
        <!-- 搜索区块 -->
        <a-col :flex="1">
          <a-form
              :model="state.queryParams"
              :label-col-props="{ span: 6 }"
              :wrapper-col-props="{ span: 18 }"
              label-align="left"
              auto-label-width
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item field="title" :label="'系统模块'">
                  <a-input
                      v-model="state.queryParams.title"
                      :placeholder="'请输入系统模块'">
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="operName" :label="'操作人员'">
                  <a-input
                      v-model="state.queryParams.operName"
                      :placeholder="'请输入操作人员'">
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="businessType" :label="'操作类型'">
                  <a-select v-model="state.queryParams.businessType" placeholder="请选择">
                    <a-option
                        v-for="dict in state.businessTypeOptions"
                        :key="dict.dictValue"
                        :value="dict.dictValue"
                        :label="dict.dictLabel"
                    >{{ dict.dictLabel }}
                    </a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="status" :label="'状态'">
                  <a-select v-model="state.queryParams.status" placeholder="请选择">
                    <a-option
                        v-for="dict in state.statusOptions"
                        :key="dict.dictValue"
                        :value="dict.dictValue"
                        :label="dict.dictLabel"
                    >{{ dict.dictLabel }}
                    </a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="dateRange" :label="'操作时间'">
                  <a-range-picker v-model="state.dateRange" style="width: 100%;"></a-range-picker>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-divider style="height: 84px" direction="vertical"/>
        <a-col :flex="'86px'" style="text-align: right">
          <a-space direction="vertical" :size="18">
            <a-button type="primary" @click="fetchOperLogData">
              <template #icon>
                <icon-search/>
              </template>
              查询
            </a-button>
            <a-button @click="resetQueryForm">
              <template #icon>
                <icon-refresh/>
              </template>
              重置
            </a-button>
          </a-space>
        </a-col>

        <a-divider style="margin-top: 0"/>
        <!-- 工具栏 -->
        <a-row style="margin-bottom: 16px">
          <!-- 前置工具栏部分 -->
          <a-col :span="12">
            <a-space>
              <a-space>
                <a-button
                    v-permission="['system:operLog:remove']" status="danger"
                    :disabled="state.selectedKeys.length <= 0" @click="handleDelete">
                  <template #icon>
                    <icon-delete/>
                  </template>
                  删除
                </a-button>
                <a-button v-permission="['system:operLog:remove']" status="danger" @click="handleClean">
                  <template #icon>
                    <icon-delete/>
                  </template>
                  清空
                </a-button>
                <a-button v-permission="['system:operLog:export']" status="warning" @click="handleExport">
                  <template #icon>
                    <icon-download/>
                  </template>
                  导出
                </a-button>
              </a-space>
            </a-space>
          </a-col>
        </a-row>
      </a-row>

      <!-- 表格数据-->
      <a-table
          ref="tableRef"
          v-model:selectedKeys="state.selectedKeys"
          row-key="operId"
          :loading="loading"
          :pagination="pagination"
          :columns="state.columns"
          :data="state.operLogList"
          :row-selection="state.rowSelection"
          :bordered="false"
          :size="'medium'"
          @sorter-change="handleSorterChange"
          @page-change="onPageChange"
      >
        <template #businessType="{ record }">
          <dict-tag :options="state.businessTypeOptions" :value="record.businessType"/>
        </template>
        <template #status="{ record }">
          <dict-tag :options="state.statusOptions" :value="record.status"/>
        </template>
        <template #optional="{ record }">
          <a-space>
            <a-button-group>
              <a-button v-permission="['system:operLog:query']" type="text" size="mini" @click="handleView(record)">
                <template #icon>
                  <icon-eye/>
                </template>
                详细
              </a-button>
            </a-button-group>
          </a-space>
        </template>
      </a-table>
    </a-card>
    <view-oper-log
        v-model:operLog="state.currentRow"
        v-model:visible="state.editVisible"
        @refresh-data-list="fetchOperLogData">
    </view-oper-log>
  </div>
</template>

<script lang="ts" setup>
// 定义页面加载中效果变量
import useLoading from "@/hooks/loading";
import {computed, reactive} from "vue";
import {DictDataRecord, getDicts} from "@/api/system/dict-data";
import {Message, Modal} from "@arco-design/web-vue";
import {Pagination} from "@/types/global";
import addDateRange from "@/utils/common";
import {listOperLog, delOperLog, cleanOperLog} from "@/api/system/operLog";
import {download} from "@/api/download";
import {TableColumnData} from "@arco-design/web-vue/es/table/interface";
import DictTag from "@/components/dict-tag/index.vue";
import ViewOperLog from "./components/view-oper-log.vue";

const {loading, setLoading} = useLoading(true);

const basePagination: Pagination = {
  current: 1,
  pageSize: 10,
};
const pagination = reactive({
  ...basePagination,
});

const state = reactive({
  queryParams: {
    orderByColumn: '',
    isAsc: '',
    title: undefined,
    operName: undefined,
    businessType: undefined,
    status: undefined
  },
  rowSelection: {
    type: 'checkbox',
    showCheckedAll: true,
    onlyCurrent: false,
  } as unknown,
  // 表格选中值
  selectedKeys: [],
  // 时间选择
  dateRange: [],
  // 列表数据
  operLogList: [],
  // 字典
  statusOptions: [] as DictDataRecord[],
  businessTypeOptions: [] as DictDataRecord[],
  // 选中行ID
  currentId: 0,
  currentRow: undefined,
  // 显示编辑页面
  editVisible: false,
  // 列表显示列
  columns: computed<TableColumnData[]>(() => [
    {
      title: '日志编号',
      dataIndex: 'operId',
      slotName: 'operId',
      width: 100,
    },
    {
      title: '系统模块',
      dataIndex: 'title',
      slotName: 'title',
      ellipsis: true,
      tooltip: {position: 'right'},
      width: 130,
    },
    {
      title: '操作类型',
      dataIndex: 'businessType',
      slotName: 'businessType',
      width: 100,
    },
    {
      title: '操作人员',
      dataIndex: 'operName',
      slotName: 'operName',
      width: 110,
    },
    {
      title: '操作地址',
      dataIndex: 'operIp',
      slotName: 'operIp',
      width: 130,
    },
    {
      title: '操作地点',
      dataIndex: 'operLocation',
      slotName: 'operLocation',
      width: 200,
    },
    {
      title: '操作状态',
      dataIndex: 'status',
      slotName: 'status',
      width: 100,
    },
    {
      title: '操作日期',
      dataIndex: 'operTime',
      slotName: 'operTime',
      sortable: {
        sortDirections: ['ascend', 'descend']
      },
      width: 200,
    },
    {
      title: '消耗时间（毫秒）',
      dataIndex: 'costTime',
      slotName: 'costTime',
      width: 180,
    },
    {
      title: '操作',
      dataIndex: 'optional',
      slotName: 'optional',
      fixed: 'right',
      width: 100,
    },
  ]),
});

// 初始化字典
const initData = async () => {
  const {data: status} = await getDicts('sys_common_status');
  state.statusOptions = status;
  const {data: businessType} = await getDicts('sys_oper_type');
  state.businessTypeOptions = businessType;
};
initData();

// 重置查询表单
const resetQueryForm = () => {
  state.queryParams = {
    orderByColumn: '',
    isAsc: '',
    title: undefined,
    operName: undefined,
    businessType: undefined,
    status: undefined
  };
  state.dateRange = [];
  state.currentRow = undefined;
};

// 获取列表数据
const fetchOperLogData = async () => {
  setLoading(true);
  const {rows, total} = await listOperLog({
    ...pagination,
    ...addDateRange(state.queryParams, state.dateRange)
  })
  state.operLogList = rows;
  pagination.total = total;
  setLoading(false);
};
fetchOperLogData();

// 分页
const onPageChange = (current: number) => {
  pagination.current = current;
  fetchOperLogData();
};

// 排序触发事件
const handleSorterChange = (dataIndex: string, direction: string) => {
  state.queryParams.orderByColumn = dataIndex;
  state.queryParams.isAsc = direction;
  fetchOperLogData();
}

// 打开详情
const handleView = (currentRow: any) => {
  state.editVisible = true;
  state.currentRow = currentRow;
};

// 删除
const handleDelete = () => {
  const ids = state.selectedKeys.join(',');
  Modal.confirm({
    titleAlign: 'start',
    title: '系统提示',
    content: `是否确认删除日志编号为"${ids}"的数据项？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      delOperLog(ids).then(() => {
        Message.success("删除成功");
        fetchOperLogData();
      });
    },
  });
};

// 清空按钮操作
const handleClean = () => {
  Modal.confirm({
    titleAlign: 'start',
    title: '系统提示',
    content: '是否确认清空所有操作日志数据项？',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      cleanOperLog().then(() => {
        Message.success("清空成功");
        fetchOperLogData();
      });
    },
  });
}

// 导出按钮操作
const handleExport = () => {
  download('system/operLog/export', state.queryParams, `oper_log_${new Date().getTime()}.xlsx`)
};

</script>

<style scoped lang="less">
.container {
  padding: 0 20px 20px 20px;
}
</style>
