<template>
  <el-container id="app">
    <el-aside class="gy-toolbar" v-bind:style="{ 'width': leftToolBarWidth + 'px' }">
      <div class="gy-toolbar-top">
        <el-tooltip class="item" effect="dark" content="书架" placement="right">
          <el-button type="primary" icon="el-icon-menu gy-toolbtn" circle @click="showPage('books')"></el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="编辑" placement="right">
          <el-button type="primary" icon="el-icon-edit gy-toolbtn" circle @click="showPage('edit')"></el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="发布" placement="right">
          <el-button type="primary" icon="el-icon-upload gy-toolbtn" circle @click="showPage('share')"></el-button>
        </el-tooltip>
      </div>
      <div class="gy-toolbar-bottom">
        <el-tooltip class="item" effect="dark" content="设置" placement="right">
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
          <el-tooltip class="item" effect="dark" content="隐藏侧边栏" placement="top">
            <button class="fa fa-eye-slash gy-footer-btn" type="text" icon="el-icon-close" @click="onSetFileListBarVisibale(false)"></button>
          </el-tooltip>
        </span>
        <span v-if=!showFileListBar class="gy-footer-left" v-bind:style="{ 'margin-left': showFileListBar ? fileListBarWidth + 'px' : '0px'}">
          <el-tooltip class="item" effect="dark" content="显示侧边栏" placement="top">
            <button class="fa fa-eye gy-footer-btn" type="text" icon="el-icon-close" @click="onSetFileListBarVisibale(true)"></button>
          </el-tooltip>
        </span>
        <span class="gy-footer-right">
          <el-tooltip class="item" effect="dark" content="当前工作目录:D:\周报文档" placement="top">
            <button class="fa fa-address-book gy-footer-btn" type="text" icon="el-icon-close"></button>
          </el-tooltip>
        </span>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script>
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
        console.log('onMinimize')
        this.$electron.remote.getCurrentWindow().minimize()
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

<style>
  html {
    width: 100%;
    height: 100%;
  }
  
  body {
    margin: 0px auto;
    width: 100%;
    height: 100%;
  }
  
  #app {
    margin: 0px auto;
    height: 100%;
    width: 100%;
  }
  
  /* 左侧工具栏样式 */
  .gy-toolbar-top, 
  .gy-toolbar-bottom{
    margin: 7px;
  }

  .gy-toolbar-top {
    min-height: calc(100vh - 160px);
    padding-top: 60px;
  }

  .gy-toolbar .el-button+.el-button {
    margin-left: 0px;
  }
  
  .gy-toolbtn {
    width: 26px;
    height: 26px;
    font-size: 26px;
  }

  /* 右侧内容区域样式 */
  .gy-container {
    padding: 1px;
  }
  
  .gy-header,
  .gy-main,
  .gy-footer {
    padding: 0px;
  }
  
  /* 右侧标题栏样式 */
  .gy-header {
    border-bottom: 1px solid rgb(237, 237, 237);
    height: 52px;
    -webkit-app-region: drag;
  }
  
  .gy-header span {
    height: 52px;
    line-height: 52px;
    font-size: 20px;
    margin-left: 12px;
  }
  
  .gy-header-btn {
    height: 52px;
    width: 32px;
    float: right;
    -webkit-app-region: no-drag;
  }
  
  /* 底部状态栏样式 */
  .gy-container .el-footer {
    line-height: 24px;
    font-size: 14px;
    /* background-color: rgba(64, 158, 255, 0.2); */
  }

  .gy-footer-right {
    float: right;
  }

  .gy-footer-btn {
    width: 24px;
    height: 24px;
    border: 0px;
  }
</style>
