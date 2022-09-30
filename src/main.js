import Vue from 'vue'
import App from './App.vue'
// 引入vue-route
import VueRouter from 'vue-router';
Vue.use(VueRouter);
import router from './route/index';
// 引入vuex
import store from './store/index';

// 引入axios
import axios from 'axios';
// 引入less
import './assets/css/global.less';
// 引入font
import './assets/font/iconfont.css';
// 引入WebSocketService
import WebSocketService from "./utils/socket_service";

// 挂载设置
Vue.prototype.$echarts=window.echarts;
Vue.prototype.$axios=axios;
// 本地测试
// axios.defaults.baseURL='http://localhost:4000/api/';
// 服务器部署
axios.defaults.baseURL='http://47.103.216.204:4000/api/';
// 创建 WebSocket 实例并连接服务端
WebSocketService.Instance.connect();
Vue.prototype.$socket=WebSocketService.instance;

Vue.config.productionTip = false
new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')
