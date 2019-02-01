import Vue from 'vue'
import axios from 'axios'

import Element from 'element-ui'
import VueCodeMirror from 'vue-codemirror'
import 'font-awesome/css/font-awesome.min.css'
import 'github-markdown-css/github-markdown.css'
import 'katex/dist/katex.min.css'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/icon/iconfont.css'
import 'vue-codemirror/node_modules/codemirror/lib/codemirror.css'
import '../config/style.css'
// icon图标 后期统一扩展 https://blog.csdn.net/b376924098/article/details/78286880

import App from './App'
import router from './router'
import store from './store'

Vue.use(Element)
Vue.use(VueCodeMirror, {events: ['paste', 'drop']})

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

window.showSuccess = (msg) => {
  try {
    vmApp.$message({
      type: 'success',
      message: msg
    })
  } catch (e) {
    alert(msg)
  }
}
