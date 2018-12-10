<template>
  <el-container id="app">
    <el-aside class="gy-toolbar" width="66px">
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
        <span>123</span>
        <el-button class="gy-header-btn" type="text" icon="el-icon-close" @click="closeWindow"></el-button>
        <el-button class="gy-header-btn" type="text" icon="el-icon-my-copy-o" @click="maximizeWindow"></el-button>
        <el-button class="gy-header-btn" type="text" icon="el-icon-minus" @click="minimizeWindow"></el-button>
      </el-header>
      <el-main class="gy-main">
        <router-view></router-view>
      </el-main>
      <el-footer class="gy-footer" height="32px">&nbsp;&nbsp;当前工作目录:D:\周报文档</el-footer>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: 'plateau',
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
    background-color: white;
  }
  
  /* 左侧工具栏样式 */
  .gy-toolbar {
    background-color: #409EFF;
  }
  
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
    color: white;
    font-size: 26px;
  }

  /* 右侧内容区域样式 */
  .gy-container {
    background-color: rgb(237, 237, 237);
    padding: 1px;
  }
  
  .gy-header,
  .gy-main,
  .gy-footer {
    padding: 0px;
    background-color: #FFFFFF;
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
    color: rgb(72, 72, 72);
    margin-left: 12px;
  }
  
  .gy-header-btn {
    height: 52px;
    width: 32px;
    float: right;
    -webkit-app-region: no-drag;
    color: rgb(148, 157, 182);
  }
  
  .gy-header-btn:hover {
    color: rgb(90 168 252);
  }
  
  .gy-header-btn:focus {
    color: rgb(148, 157, 182);
  }
  
  /* 底部状态栏样式 */
  .gy-container .el-footer {
    line-height: 32px;
    color: rgb(130, 130, 130);
    font-size: 14px;
  }
</style>
