<template>
  <div v-loading="isLoading">
    <div class="dflex">
      <div
        class="flex"
        :style="`padding-right: ${toggleConfig.show ? '10px' : 0}`"
      >
        <slot name="header" :$data="$data"></slot>
      </div>
      <div
        v-if="toggleConfig.show"
        class="handle-icons"
        :class="toggleConfig.tgClass"
      >
        <i
          v-show="showType === 'card'"
          title="列表展示"
          :class="
            toggleConfig.tableIconClass
              ? toggleConfig.tableIconClass
              : 'el-icon-s-operation'
          "
          @click="
            showType = 'table';
            toggleRowSelection();
          "
        ></i>
        <i
          v-show="showType === 'table'"
          title="卡片展示"
          :class="
            toggleConfig.cardIconClass
              ? toggleConfig.cardIconClass
              : 'el-icon-menu'
          "
          @click="showType = 'card'"
        ></i>
      </div>
    </div>
    <div class="chen-table-wrapper">
      <!-- 表格布局 -->
      <el-table
        v-if="columnsConfig.length && showType === 'table'"
        ref="chenTable"
        :data="dataSource"
        :height="noDefaultHeight ? null : maxHeight"
        :maxHeight="maxTableHeight || maxHeight"
        :rowKey="rowKey"
        :class="{ hideCheckAll: single }"
        :highlight-current-row="currentRow"
        headerRowClassName="text-left"
        border
        fit
        stripe
        class="chen-table"
        @select="selectionChange"
        @select-all="selectionChange"
        v-bind="tableConfig"
        v-on="$listeners"
      >
        <el-table-column
          v-if="selection"
          type="selection"
          width="55"
          align="center"
          fixed="left"
        >
        </el-table-column>
        <el-table-column
          v-for="(column, index) in tableColumnsConfig"
          :key="index"
          show-overflow-tooltip
          v-bind="column"
        >
          <template slot-scope="scope">
            <slot
              v-if="column.slotName"
              :name="column.slotName"
              :scope="scope"
            ></slot>
            <div v-else>
              {{ scope.row[column.prop] }}
            </div>
          </template>
        </el-table-column>
        <template slot="empty">
          <div>
            <slot v-if="emptySlotName" :name="emptySlotName" />
            <el-empty v-else description="暂无数据"></el-empty>
          </div>
        </template>
      </el-table>
      <!-- 卡片布局 -->
      <el-row
        v-if="showType === 'card'"
        class="card-wrapper"
        :gutter="20"
        :style="`height: ${noDefaultHeight ? 'auto' : maxHeight + 'px'}`"
      >
        <template v-if="dataSource.length">
          <el-col
            v-bind="cardConfig.grid || defaultCardGrid"
            v-for="(item, index) in dataSource"
            :key="index"
          >
            <div class="card-main" @click="selectionCardChange(item)">
              <slot
                v-if="cardConfig && cardConfig.slotName"
                :name="cardConfig.slotName"
                :scope="{ row: item }"
              ></slot>
              <el-card v-else style="width: 100%">
                <div class="dflex">
                  <div class="flex ellipsis">
                    <h4 class="ellipsis">
                      <span :title="item.name">{{ item.name }}</span>
                    </h4>
                    <div
                      v-for="(column, index) in cardColumnsConfig"
                      :key="index"
                    >
                      <div v-if="column.slotName">
                        <div class="dflex ellipsis">
                          <strong>{{ column.label }}：</strong>
                          <div class="flex ellipsis">
                            <slot
                              :name="column.slotName"
                              :scope="{ row: item }"
                            ></slot>
                          </div>
                        </div>
                      </div>
                      <div class="dflex ellipsis" v-else>
                        <strong>{{ column.label }}：</strong>
                        <span
                          class="flex ellipsis"
                          :title="item[column.prop]"
                          >{{ item[column.prop] }}</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
                <div class="handle" v-if="handleConfig" @click.stop>
                  <slot
                    :name="handleConfig.slotName"
                    :scope="{ row: item }"
                  ></slot>
                </div>
              </el-card>
              <i
                class="el-icon-check el-icon-success"
                v-if="multipleSelection.includes(item)"
              ></i>
            </div>
          </el-col>
        </template>
        <template v-else>
          <el-col :span="24" v-if="cardConfig.emptySlotName">
            <slot :name="handleConfig.slotName" :scope="{ row: item }"></slot>
          </el-col>
          <el-col :span="24" v-else>
            <slot v-if="emptySlotName" :name="emptySlotName" />
            <el-empty v-else description="暂无数据"></el-empty>
          </el-col>
        </template>
      </el-row>
    </div>
    <div class="pagination-wrapper" v-if="pagination">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="pager.pageSizes"
        :page-size.sync="pager.defaultPageSize"
        :current-page.sync="pager.currentPage"
        :total="total"
        @current-change="() => (apiFn ? getData() : goWebPage())"
        @size-change="() => (apiFn ? getData() : goWebPage())"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: "ElTableChen",
  props: {
    type: {
      //表格呈现类型  card(卡片) or table(表格)
      type: String,
      default: "table",
    },
    toggleConfig: {
      // 切换配置
      type: Object,
      default: () => ({
        show: false, //是否显示
        tableIconClass: "", //表格图标类名
        cardIconClass: "", //卡片图标类名
        tgClass: "", // 容器类名
      }),
    },
    apiFn: {
      // 远程获取数据函数，如果apiFn不为空，则调用此函数，否则数据表格数据直接读取tableData属性
      type: Function,
      default: null,
    },
    responseFn: {
      type: Function,
      default: null,
    },
    tableData: {
      // 数据
      type: Array,
      default: null,
    },
    autoGetData: {
      // 是否自动加载数据
      type: Boolean,
      default: true,
    },
    currentRow: {
      // 选中行是否高亮
      type: Boolean,
      default: false,
    },
    query: {
      // 查询条件，字符串或者对象a=b&c=d、{a:b}
      type: [String, Object],
      default: "",
    },
    tableConfig: {
      // 表格配置，同el-table表格属性配置https://element.eleme.cn/#/zh-CN/component/table#table-attributes
      type: Object,
      default: () => {},
    },
    columnsConfig: {
      // 表格列配置，同el-table-column配置https://element.eleme.cn/#/zh-CN/component/table#table-attributes；增加slotName属性，如果存在，则优先使用插槽名为slotName属性值的数据
      type: Array,
      default: () => [],
    },
    rowKey: {
      type: String,
      default: "id",
    },
    selection: {
      // 是否显示多选框
      type: Boolean,
      default: false,
    },
    single: {
      // 是否是单选
      type: Boolean,
      default: false,
    },
    pagination: {
      // 是否有分页
      type: Boolean,
      default: true,
    },
    pageSizes: {
      // 分页配置
      type: Array,
      default: () => [10, 20, 50],
    },
    containerId: {
      // 组件容器id
      type: String,
      default: "",
    },
    autoHeight: {
      // 自适应高度
      type: Boolean,
      default: true,
    },
    offsetHeight: {
      // 高度偏移,值越大组件高度越小
      type: Number,
      default: 70,
    },
    minHeight: {
      // 表格最小高度
      type: Number,
      default: 200,
    },
    noDefaultHeight: {
      // 是否没有默认高度，没有数据或则数据少的时候的默认高度
      type: Boolean,
      default: false,
    },
    maxTableHeight: {
      // 表格最大高度
      type: Number,
      default: 1000000000000,
    },
    defaultSelectionKeys: {
      // 默认选中id数组
      type: Array,
      default: () => [],
    },
    cardConfig: {
      // 卡片配置
      type: Object,
      default: () => ({
        slotName: "", // 插槽名字
        emptySlotName: "",
        grid: {
          xs: 24,
          sm: 12,
          md: 12,
          lg: 8,
        },
      }),
    },
    finishCallBack: {
      // 获取数据完成后的回调
      type: Function,
      default: () => {},
    },
    emptySlotName: {
      // 没有数据插槽名
      type: String,
      default: "",
    },
  },
  data() {
    return {
      isLoading: false,
      maxHeight: 600,
      showType: "table",
      multipleSelection: [],
      dataSource: [],
      total: 0,
      pager: {
        pageSizes: [10, 20, 50],
        defaultPageSize: 20,
        currentPage: 1,
      },
      handleConfig: null,
      defaultCardGrid: {
        xs: 24,
        sm: 12,
        md: 12,
        lg: 8,
      },
    };
  },
  watch: {
    columnsConfig: {
      handler() {
        this.handleConfig = this.columnsConfig.find(
          (item) =>
            (item.props === "handle" || item.slotName === "handle") &&
            !item.hidden
        );
      },
      deep: true,
      immediate: true,
    },
    tableData() {
      this.multipleSelection = [];
      this.goWebPage();
    },
    dataSource() {
      this.multipleSelection = [];
      if (this.defaultSelectionKeys && this.defaultSelectionKeys.length) {
        this.setDefaultSelection();
      }
    },
    defaultSelectionKeys() {
      this.multipleSelection = [];
      this.$refs.chenTable.clearSelection();
      if (this.defaultSelectionKeys && this.defaultSelectionKeys.length) {
        this.setDefaultSelection();
      }
    },
    autoHeight() {
      if (this.autoHeight) {
        this.updateHeight();
      } else {
        this.removeEventListener();
      }
    },
    noDefaultHeight() {
      this.$nextTick(() => {
        this.doLayout();
      });
    },
  },
  computed: {
    tableColumnsConfig() {
      return this.columnsConfig.filter((column) => !column.hidden);
    },
    cardColumnsConfig() {
      return this.columnsConfig.filter(
        (column) =>
          !column.hidden &&
          column.prop != "handle" &&
          column.slotName != "handle"
      );
    },
  },
  created() {
    this.pager.pageSizes = this.pageSizes;
    this.pager.defaultPageSize = this.pager.pageSizes[0];
  },
  mounted() {
    if (this.apiFn && this.autoGetData) {
      this.getData();
    } else {
      this.multipleSelection = [];
      this.dataSource = this.tableData || [];
      this.goWebPage();
    }
    this.showType = this.type;
  },
  updated() {
    this.updateHeight();
  },
  destroyed() {
    this.removeEventListener();
  },
  methods: {
    // 请求参数格式化
    formatQuery(query) {
      let data = "";
      if (typeof query === "string") {
        let arr = query.split("?")[1].split("&");
        arr.forEach((str, index) => {
          let arr1 = str.split("=");
          let key = arr1[0];
          let value = arr1[1] || arr1[1] == 0 ? arr1[1] : "";
          if (index == 0) {
            data += `?${key}=${encodeURI(value)}`;
          } else {
            data += `&${key}=${encodeURI(value)}`;
          }
        });
      } else {
        data = query || {};
      }
      return data;
    },
    // 远程获取数据
    getData() {
      if (this.apiFn) {
        this.isLoading = true;
        let query = null;
        if (typeof this.query === "string") {
          query = `?page=${this.pager.currentPage}&size=${
            this.pager.defaultPageSize
          }${this.query ? "&" + this.query : ""}`;
        } else {
          query = {
            ...this.query,
            pageNo: this.pager.currentPage,
            pageSize: this.pager.defaultPageSize,
          };
        }

        query = this.formatQuery(query);

        this.apiFn(query)
          .then((res) => {
            this.isLoading = false;
            let responseFn =
              this.responseFn && typeof this.responseFn == "function"
                ? this.responseFn
                : this.$elTableChen.responseFn &&
                  typeof this.$elTableChen.responseFn == "function"
                ? this.$elTableChen.responseFn
                : this.defaultResponseFn;
            responseFn.call(this, res);
            this.setChekedSelection();
            this.finishCallBack(this.dataSource);
          })
          .catch(() => {
            this.isLoading = false;
          });
      }
    },
    defaultResponseFn(res) {
      if (res && res.data && Array.isArray(res.data)) {
        this.dataSource = res.data || [];
        this.total = this.dataSource.length;
      } else {
        this.dataSource = res && res.data && res.data.list ? res.data.list : [];
        this.total = res.data.totalCount;
      }
    },
    // 前端分页
    goWebPage() {
      if (this.tableData) {
        let { defaultPageSize, currentPage } = this.pager;
        this.total = this.tableData.length;
        if (this.pagination) {
          let start = (currentPage - 1) * defaultPageSize;
          let end = start + defaultPageSize;
          this.dataSource = this.tableData.slice(start, end);
          if (this.tableData.length && !this.dataSource.length) {
            start = (currentPage - 2) * defaultPageSize;
            this.dataSource = this.tableData.slice(start, end);
          }
        } else {
          this.dataSource = this.tableData || [];
        }
      }
    },
    // 设置默认选中
    setDefaultSelection() {
      this.$nextTick(() => {
        this.defaultSelectionKeys.forEach((rowKey) => {
          let row = this.dataSource.find((row) => row[this.rowKey] === rowKey);
          if (row) {
            this.multipleSelection.push(row);
          }
        });
        this.toggleRowSelection();
      });
    },
    toggleRowSelection() {
      this.$nextTick(() => {
        this.$refs.chenTable &&
          this.multipleSelection.map((item) => {
            let row = this.dataSource.find(
              (row) => row[this.rowKey] === item[this.rowKey]
            );
            if (row) {
              this.$refs.chenTable.toggleRowSelection(row, true);
            }
          });
      });
    },
    selectionCardChange(row) {
      let rowIndex = this.multipleSelection.findIndex(
        (item) => item[this.rowKey] === row[this.rowKey]
      );
      if (rowIndex > -1) {
        this.multipleSelection.splice(rowIndex, 1);
      } else {
        this.multipleSelection = [...this.multipleSelection, row];
      }
      this.selectionChange(this.multipleSelection, row);
    },
    // 多选
    selectionChange(multipleSelection, row) {
      if (this.single) {
        // 单选
        this.$refs.chenTable && this.$refs.chenTable.clearSelection();
        let isSelectCurrentRow = multipleSelection.some(
          (item) => item[this.rowKey] === row[this.rowKey]
        );
        if (isSelectCurrentRow) {
          this.$refs.chenTable &&
            this.$refs.chenTable.toggleRowSelection(row, true);
          this.multipleSelection = [row];
        } else {
          this.multipleSelection = [];
        }
      } else {
        this.multipleSelection = multipleSelection;
      }
    },
    // 翻页设置选中的数据行勾选
    setChekedSelection() {
      // this.$nextTick(() => {
      //   if (this.multipleSelection && this.multipleSelection.length) {
      //     this.multipleSelection.forEach((item) => {
      //       let row = this.dataSource.find((row) => row.id === item.id);
      //       if (row) {
      //         this.$refs.chen-table.toggleRowSelection(row, true);
      //         this.multipleSelection.push(row);
      //       }
      //     });
      //   }
      // });
    },
    // 刷新
    refresh() {
      this.pager.currentPage = 1;
      this.getData();
    },
    // 重绘表格
    doLayout() {
      this.$nextTick(() => {
        this.$refs.chenTable && this.$refs.chenTable.doLayout();
        this.$forceUpdate();
      });
    },
    // 取得组件data里某个属性的数据，暴露给父级组件使用
    getComponentData(key) {
      return key ? this[key] : null;
    },
    // 设置表格最大高度
    setMaxHeight() {
      let containerId = this.containerId || this.$elTableChen.containerId;
      if (!containerId || !document.getElementById(containerId)) return;

      let minusSelectors = [".header"];
      if (this.pagination) minusSelectors.push("el-pagination");
      this.maxHeight = this.getTableMaxHeight(
        minusSelectors,
        this.offsetHeight,
        `#${containerId}`
      );
    },
    // 拿到表格的高度和最高高度 高度===最高高度
    getTableMaxHeight(
      minusSelectors,
      minusHeight = 100,
      containerSelector = this.containerId,
      minHeight = this.minHeight
    ) {
      let [container, minusHeightTotal] = [
        document.querySelector(containerSelector),
        minusHeight,
      ];
      if (!container) return minHeight;

      let [boxHeight, maxHeight] = [container.clientHeight, maxHeight];

      if (navigator.userAgent.includes("Firefox")) minusHeightTotal += 20;
      for (let selector of minusSelectors) {
        container.querySelector(selector) &&
          (minusHeightTotal += container.querySelector(selector).clientHeight);
      }
      maxHeight = boxHeight - minusHeightTotal;
      return maxHeight > minHeight ? maxHeight : minHeight;
    },
    updateHeight() {
      if (this.autoHeight) {
        this.setMaxHeight();
        window.addEventListener("resize", this.setMaxHeight);
      }
    },
    removeEventListener() {
      window.removeEventListener("resize", this.setMaxHeight);
    },
  },
};
</script>

<style lang="less" scoped>
.dflex {
  display: flex;
}
.flex {
  flex: 1;
}
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
  word-break: break-all;
}
.chen-table-wrapper {
  width: 100%;
}

.chen-table {
  width: 100%;
  color: rgba(0, 0, 0, 0.73);
  th {
    font-weight: 500;
    color: rgba(0, 0, 0, 0.73) !important;
    background: #f9fcff;
    background-color: #f9fcff;
  }
  td {
    padding: 4px 0 !important;
    .el-tooltip > div {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      -o-text-overflow: ellipsis;
      word-break: break-all;
    }
  }

  tr.el-table__row--striped td {
    background: #f6f6f6;
  }
}

.hideCheckAll /deep/ th.el-table-column--selection > .cell {
  display: none !important;
}

.pagination-wrapper {
  text-align: right;
  margin-top: 20px;
}

.el-pagination.is-background .btn-next,
.el-pagination.is-background .btn-prev,
.el-pagination.is-background .el-pager li {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.el-pagination.is-background .btn-next,
.el-pagination.is-background .btn-prev {
  padding-left: 5px;
  padding-right: 5px;
}
.el-pagination.is-background .el-pager li:not(.disabled).active {
  background: #fff;
  border: 1px solid #2d8cf0;
  color: #2d8cf0;
}
.el-pagination.is-background .btn-next.disabled,
.el-pagination.is-background .btn-next:disabled,
.el-pagination.is-background .btn-prev.disabled,
.el-pagination.is-background .btn-prev:disabled,
.el-pagination.is-background .el-pager li.disabled {
  border: 1px solid #ddd;
  background: #f7f9fc;
  color: #8f9bb2;
}
.el-pagination.is-background,
.el-pagination__total,
.el-pagination.is-background .btn-next,
.el-pagination.is-background .btn-prev,
.el-pagination.is-background .el-pager li,
.el-pagination__jump {
  color: #282b2e;
}
.handle-icons {
  padding-top: 16px;
  i {
    font-size: 30px;
    color: #818a90;
    cursor: pointer;
    &:hover {
      color: rgba(0, 117, 201, 0.85);
    }
  }
}
.card-wrapper {
  font-size: 14px;
  line-height: 26px;
  overflow-y: auto;
  text-align: left;
  .card-main {
    position: relative;
  }
  h4 {
    padding: 0 0 10px 0;
    margin: 0 0 10px 0;
    text-align: left;
    font-size: 16px;
    border-bottom: 1px solid #ddd;
  }
  strong {
    display: block;
  }
  /deep/ .el-col {
    margin-bottom: 15px;
  }
  .handle {
    margin-top: 10px;
    padding-top: 15px;
    border-top: 1px solid #ddd;
    /deep/ .el-button {
      padding-top: 0;
      padding-bottom: 0;
    }
  }
  /deep/ .el-icon-check {
    position: absolute;
    top: 8px;
    right: 3px;
    font-size: 40;
    color: #67c23a;
  }
  .card-empty {
    line-height: 200px;
    text-align: center;
    color: #999;
    font-size: 16px;
  }
}
.el-tooltip__popper {
  max-width: 600px;
  white-space: normal !important;
  line-height: 20px;
}
</style>
