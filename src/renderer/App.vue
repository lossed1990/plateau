<template>
  <el-container id="app">
    <el-aside class="gy-toolbar" v-bind:style="{ 'width': leftToolBarWidth + 'px' }">
      <div class="gy-toolbar-top">
        <el-tooltip class="item" content="书架" placement="right" popper-class="gy-tool-tip">
          <el-button type="primary" icon="el-icon-menu gy-toolbtn" circle @click="showPage('books')"></el-button>
        </el-tooltip>
        <el-tooltip class="item" content="编辑" placement="right" popper-class="gy-tool-tip">
          <el-button type="primary" icon="el-icon-edit gy-toolbtn" circle @click="showPage('edit')"></el-button>
        </el-tooltip>
        <el-tooltip class="item" content="发布" placement="right" popper-class="gy-tool-tip">
          <el-button type="primary" icon="el-icon-upload gy-toolbtn" circle @click="showPage('share')"></el-button>
        </el-tooltip>
      </div>
      <div class="gy-toolbar-bottom">
        <el-tooltip class="item" content="设置" placement="right" popper-class="gy-tool-tip">
          <el-button type="primary" icon="el-icon-setting gy-toolbtn" circle @click="showPage('setting')"></el-button>
        </el-tooltip>
      </div>
    </el-aside>
    <el-container class="gy-container">
      <el-header class="gy-header" @dblclick="maximizeWindow" height="52px">
        <span></span>
        <el-button class="gy-header-btn" type="text" icon="el-icon-close" @click="closeWindow"></el-button>
        <el-button class="gy-header-btn" type="text" icon="el-icon-my-copy-o" @click="maximizeWindow"></el-button>
        <el-button class="gy-header-btn" type="text" icon="el-icon-minus" @click="minimizeWindow"></el-button>
      </el-header>
      <el-main class="gy-main">
        <router-view></router-view>
      </el-main>
      <el-footer v-if=showStatusBar class="gy-footer" height="24px">
        <span v-if=showFileListBar class="gy-footer-left" v-bind:style="{ 'margin-left': showFileListBar ? fileListBarWidth + 'px' : '0px'}">
          <el-tooltip class="item" content="隐藏侧边栏" placement="top" popper-class="gy-tool-tip">
            <button class="fa fa-eye-slash gy-footer-btn" type="text" icon="el-icon-close" @click="onSetFileListBarVisibale(false)"></button>
          </el-tooltip>
        </span>
        <span v-if=!showFileListBar class="gy-footer-left" v-bind:style="{ 'margin-left': showFileListBar ? fileListBarWidth + 'px' : '0px'}">
          <el-tooltip class="item" content="显示侧边栏" placement="top" popper-class="gy-tool-tip">
            <button class="fa fa-eye gy-footer-btn" type="text" icon="el-icon-close" @click="onSetFileListBarVisibale(true)"></button>
          </el-tooltip>
        </span>
        <span class="gy-footer-right">
          <el-tooltip class="item" content="当前工作目录:D:\周报文档" placement="top" popper-class="gy-tool-tip">
            <button class="fa fa-address-book gy-footer-btn" type="text" icon="el-icon-close"></button>
          </el-tooltip>
        </span>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script>
  import './assets/scss/app.scss'
  import { mapState } from 'vuex'

  export default {
    name: 'plateau',
    computed: mapState({
      leftToolBarWidth: state => state.UIStore.leftToolBarWidth,
      fileListBarWidth: state => state.UIStore.fileListBarWidth,
      showStatusBar: state => state.UIStore.showStatusBar,
      showFileListBar: state => state.UIStore.showFileListBar
    }),
    created: function () {
      // 初始化UI尺寸、布局等，后期考虑统一配置
      this.$store.dispatch('setLeftToolBarWidth', 66)
      this.$store.dispatch('showStatusBar', false)
    },
    methods: {
      minimizeWindow () {
        // console.log('onMinimize')
        this.$electron.remote.getCurrentWindow().minimize()

        // 换肤测试代码
        // if (document.body.getAttribute('theme') === 'light') {
        //   document.body.setAttribute('theme', 'dark')
        // } else {
        //   document.body.setAttribute('theme', 'light')
        // }
      },
      maximizeWindow () {
        console.log('onMaximize')
        let currentWindow = this.$electron.remote.getCurrentWindow()
        console.log(currentWindow)
        if (currentWindow.isMaximized()) {
          console.log('isMaximized true')
          currentWindow.unmaximize()
        } else {
          console.log('isMaximized false')
          currentWindow.maximize()
        }
      },
      closeWindow () {
        this.$electron.remote.getCurrentWindow().close()
      },
      showPage (location) {
        this.$router.push(location)
      },
      onSetFileListBarVisibale (bVisible) {
        this.$store.dispatch('showFileListBar', bVisible)
      }
    }
  }
</script>
