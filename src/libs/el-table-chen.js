import ElTableChen from "./el-table-chen.vue";

ElTableChen.install = function (Vue, opts = {}) {
  Vue.prototype.$elTableChen = opts;
  Vue.component(ElTableChen.name, ElTableChen)
}

export default ElTableChen
