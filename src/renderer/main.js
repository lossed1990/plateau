import Vue from 'vue'
import axios from 'axios'

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/icon/iconfont.css'

import App from './App'
import router from './router'
import store from './store'

Vue.use(Element)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

require('./scripts/init.js')

/* eslint-disable no-new */
var vmApp = new Vue({
  el: '#app',
  components: { App },
  router,
  store,
  template: '<App/>'
})

window.showError = (msg) => {
  try {
    vmApp.$message({
      type: 'error',
      message: msg
    })
  } catch (e) {
    alert(msg)
  }
}
