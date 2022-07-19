// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './example/App.vue';

import ElTableChen from "../lib/el-table-chen.min.js";
// import ElTableChen from "./libs/el-table-chen";

Vue.use(ElementUI);
Vue.use(ElTableChen, {
  containerId: 'app', // 全局配置容器id
  responseFn: function (res) { // 全局ajax请求成功后的回调函数，可不配置
    if (res && res.data && Array.isArray(res.data)) {
      this.dataSource = res.data || [];
      this.total = this.dataSource.length;
    } else {
      this.dataSource = res && res.data && res.data.list ? res.data.list : [];
      this.total = res.data.totalCount;
    }
  }
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: {
    App
  },
  template: '<App/>'
})
