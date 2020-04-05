import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
//导入字体图标
import './assets/fonts/iconfont.css'
//引入axios
import axios from 'axios'
//设置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//设置vue原型对象
Vue.prototype.$axios = axios

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
