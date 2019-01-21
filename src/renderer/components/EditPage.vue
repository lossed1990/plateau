<template>
  <div id="gy_edit">
    <div class="gy-leftcontainer-div" :style="{ width: leftListBarWidth + 'px' }">
      <gy-sidebar ref="sidebar" @show-menu="onShowMenu">
      </gy-sidebar>
    </div>
    <div class="gy-middlesplit-div" v-bind:style="{ left: splitLeft + 'px' }" @pointerdown="onMouseDown" @pointerup="onMouseUp"></div>
    <div class="gy-rightcontainer-div" v-bind:style="{ 'margin-left': splitRight + 'px' }">
      <codemirror
        ref="editor"
        :code="code"
        :options="editorOptions"
      />
    </div>
    <gy-menu :menus="rightmenus" @click-menu="onClickMenu"></gy-menu>
  </div>
</template>

<script>
  import editorOptions from '@/scripts/editor.js'
  import { mapState } from 'vuex'
  import ComponentMenu from './common/Menu'

  const _configHelper = require('../scripts/bookmanager.js')

  // 左侧工具栏（文件、大纲）
  var ComponentSideBar = {
    props: [],
    template: `
      <div class="gy-sidebar-div">
        <div class="gy-sidebartab-div">
          <div style="flex:1"></div>
          <div class="gy-panel-tab" :class="{ 'gy-panel-tab-active': name === 'files' }" @click="onChangeTab('files')">
            <div class="gy-panel-tab-title">文件</div>
            <div class="gy-panel-tab-border"></div>
          </div>
          <div style="flex:1"></div>
          <div class="gy-panel-tab" :class="{ 'gy-panel-tab-active': name === 'outline' }" @click="onChangeTab('outline')">
            <div class="gy-panel-tab-title">大纲</div>
            <div class="gy-panel-tab-border"></div>
          </div>
          <div style="flex:1"></div>
        </div>
        <div v-if="name === 'files'" class="gy-sidebarpanel-div">
          <div class="gy-filestop-div">
            <span class="el-icon-document"></span>
            <input type="text" class="gy-filename-input" readonly='readonly' unselectable='on' :value="currentSelectBookName"/>
            <button class="el-icon-plus gy-addfile-btn" title="新建文件" @click="onAddFile()"></button>
          </div>
          <div v-for="(file, index) in files" :key="file.name">
            <div class="gy-filename-div" :class="{ 'gy-filename-div-active': fileindex === index }" :index=index @click="onClickFileName(index)" @contextmenu="onShowMenu(index, $event)">
              <span class="el-icon-document"></span>
              <input type="text" class="gy-filename-input" :value="file.name" :readonly="file.rename ? false : 'readonly'" :unselectable="file.rename ? false : 'on'" @dblclick="onDbclickFilename(index)" @blur="onBlueFilename(file.name, index , $event)"/>
            </div>
          </div>
        </div>
        <div v-if="name === 'outline'" class="gy-sidebarpanel-div">
          outline
        </div>
      </div>
    `,
    data: function () {
      return {
        name: 'files',
        fileindex: 0,
        files: [] // [{ name: '123', rename: false }, { name: '1231', rename: false }]
      }
    },
    created: function () {
      console.log('created', this.currentSelectBookName)
      console.log('created', this.currentSelectBookPath)
      let mdFiles = _configHelper.selectMdFiles(this.currentSelectBookPath)
      this.files.splice(0, this.files.length, ...mdFiles)
    },
    watch: {
      currentSelectBookPath: function (data) {
        console.log('改变', data)
        let mdFiles = _configHelper.selectMdFiles(data)
        this.files.splice(0, this.files.length, ...mdFiles)
      }
    },
    methods: {
      onChangeTab: function (tab) {
        this.name = tab
      },
      onClickFileName: function (index) {
        this.fileindex = index
      },
      onShowMenu: function (index, event) {
        this.$emit('show-menu', index, event)
      },
      onClickMenu: function (name, userdata) {
        console.log('onClickMenu 删除文件', name, userdata)
        switch (name) {
          case '打开':
            break
          case '删除':
            if (_configHelper.deleteMdFile(this.currentSelectBookPath, this.files[userdata].name)) {
              this.files.splice(userdata, 1)
            } else {
              window.showError('文件删除失败！')
            }
            break
          case '重命名':
            this.onDbclickFilename(userdata)
            break
        }
      },
      onAddFile: function () {
        let nIndex = 1
        let newName = `新建文件${nIndex}.md`
        while (this.files.findIndex((item) => item.name === newName) !== -1) {
          ++nIndex
          newName = `新建文件${nIndex}.md`
        }

        if (_configHelper.createMdFile(this.currentSelectBookPath, newName)) {
          this.files.splice(0, 0, {name: newName, rename: true})
        }
      },
      onDbclickFilename: function (index) {
        let temp = this.files[index]
        temp.rename = true
        this.files.splice(index, 1, temp)
      },
      onBlueFilename: function (name, index, e) {
        let newName = e.target.value
        if (name !== newName && this.files.findIndex((item) => item.name === newName) !== -1) {
          window.showError('文件名已存在，请重新修改！')
        } else {
          if (_configHelper.modifyMdFileName(this.currentSelectBookPath, name, newName)) {
            let temp = this.files[index]
            temp.rename = false
            temp.name = newName
            this.files.splice(index, 1, temp)
          } else {
            window.showError('文件名修改失败！')
          }
        }
      }
    },
    computed: {
      ...mapState({
        currentSelectBookName: state => state.DataStore.currentSelectBook.name,
        currentSelectBookPath: state => state.DataStore.currentSelectBook.path
      })
    }
  }

  export default {
    data: function () {
      return {
        leftListBarWidth: 200,
        code: '',
        editorOptions,
        rightmenus: {visible: false, left: 200, top: 200, items: ['删除'], userdata: 1}
      }
    },
    components: {
      'gy-sidebar': ComponentSideBar,
      'gy-menu': ComponentMenu
    },
    created: function () {
      // console.log(this.currentSelectBook.path)
    },
    computed: {
      splitLeft () {
        return this.leftListBarWidth + this.leftToolBarWidth
      },
      splitRight () {
        return this.splitLeft + 4 - this.leftToolBarWidth
      },
      ...mapState({
        leftToolBarWidth: state => state.UIStore.leftToolBarWidth
      })
    },
    methods: {
      onMouseDown: function (event) {
        let dx = this.leftListBarWidth - event.clientX
        event.target.setPointerCapture(event.pointerId)
        event.target.onpointermove = (ev) => {
          this.leftListBarWidth = ev.clientX + dx
          if (this.leftListBarWidth < 100) {
            this.leftListBarWidth = 100
          }

          if (this.leftListBarWidth > 500) {
            this.leftListBarWidth = 500
          }
          // console.log('onMouseMove>>w:' + this.leftListBarWidth)
        }
      },
      onMouseUp: function (event) {
        // console.log('onMouseUp')
        event.target.releasePointerCapture(event.pointerId)
        event.target.onpointermove = null
      },
      onShowMenu: function (index, event) {
        let menuInfo = {
          left: event.clientX,
          top: event.clientY,
          items: ['打开', '', '删除', '重命名'],
          userdata: index,
          visible: true
        }
        this.rightmenus = menuInfo
      },
      onClickMenu: function (name, userdata) {
        this.rightmenus = {visible: false}
        this.$refs.sidebar.onClickMenu(name, userdata)
      }
    }
  }
</script>

<style>
  #gy_edit {
    float: left;
    width: 100%;
  }

  .gy-leftcontainer-div {
    width: 196px;
    height: calc(100vh - 84px);
    /* background: tomato; */
    overflow-y: auto;
    position: fixed;
  }

  .gy-middlesplit-div {
    /* background: cornflowerblue; */
    left: 196px;
    border-left: 1px solid #EDEDED;
    width: 3px;
    height: calc(100vh - 84px);
    position: fixed;
    cursor: w-resize;
  }

  .gy-rightcontainer-div {
    margin-left: 200px;
    background-color: greenyellow;
  }

  .gy-sidebartab-div {
    /* display: block; */
    /* background-color: red; */
    display: flex;
    margin-bottom: 18px;
  }

  .gy-panel-tab {
    width: 84px;
    display: block;
    text-align: center;
    cursor: pointer;
    margin-top: 8px;
    /* background-color: blue; */
  }

  .gy-panel-tab-title {
    font-size: 14px;
    color: #606266;
    height: 22px;
  }

  .gy-panel-tab-border {
    height: 4px;
  }

  .gy-panel-tab-active .gy-panel-tab-title {
    font-weight: bold;
  }

  .gy-panel-tab-active .gy-panel-tab-border {
    background-color: black;
  }

  .gy-filestop-div {
    padding: 5px 2px 5px 2px;
    white-space: nowrap;
  }

  .gy-filestop-div span{
    /* font-size: 12px;
    font-weight: bold; */
  }
  
  .gy-filename-div {
    padding: 5px 10px 5px 10px;
    white-space: nowrap;
  }

  .gy-filename-div-active,
  .gy-filename-div-active .gy-filename-input{
    background-color: rgb(238,238,238);
  }

  .gy-filename-div:hover,
  .gy-filename-div:hover .gy-filename-input
   {
    background-color: rgb(248,248,248);
  }

  .gy-filename-input {
    width: calc(100% - 60px);
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    border: 0px;
    outline: -webkit-focus-ring-color auto 5px;
    outline-offset: -2px;
  }
  
  .gy-filename-input[readonly] {
    border: 0px;
    outline: none;
    cursor: pointer;
    user-select: none;
  }

  .gy-addfile-btn {
    width: 30px;
    height:26px;
    margin-right: 6px;
    background-color: white;
    border: none;
    outline:none;
    cursor: pointer;
  }

  .gy-addfile-btn:hover {
    background-color: rgb(238, 238, 238);
  }

  .gy-addfile-btn:active {
    background-color: rgb(200, 200, 200);
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background-color: rgb(212, 213, 214);
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background-color: rgb(212, 213, 214);
  }

  .vue-codemirror {
    /* background-color: rgb(59, 174, 250); */
    font-size: 18px;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    color: #606266;
    max-width: 800px;
    position: relative;
    margin: 0 auto;
  }

  .CodeMirror {
    height: 100%;
  }
  
  .CodeMirror .CodeMirror-lines {
    line-height: 32px;
  }
  
  .CodeMirror-cursor {
    background: #606266;
  }

  .CodeMirror .CodeMirror-gutters {
    border-right: 0px;
  }
</style>
