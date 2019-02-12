<template>
  <div id="gy_edit_component" @keyup.ctrl.83="onSave">
    <div v-if=showFileListBar class="gy-filelistbar-div" :style="{ width: fileListBarWidth + 'px' }">
      <gy-edit-filelistbar ref="filelistbar" :barwidth=fileListBarWidth :outlinehtml=outlinehtml @show-menu="onShowMenu">
      </gy-edit-filelistbar>
    </div>
    <div v-if=showFileListBar class="gy-editsplit-div" v-bind:style="{ left: editsplitLeft + 'px' }" @pointerdown="onMouseDown" @pointerup="onMouseUp"></div>
    <div class="gy-editcontainer-div" v-bind:style="{ 'margin-left': showFileListBar ? editMarginLeft + 'px' : '0px' }">
      <div class="gy-edit-tool">
        <span class="gy-edit-tool-left">
          <el-tooltip class="item" effect="dark" content="粗体" placement="bottom">
            <button class="fa fa-bold gy-edit-tool-btn" type="text" @click="onToolBtnBold"></button>
          </el-tooltip>
        </span>
        <span class="gy-edit-tool-left">
          <el-tooltip class="item" effect="dark" content="斜体" placement="bottom">
            <button class="fa fa-italic gy-edit-tool-btn" type="text" @click="onToolBtnItalic"></button>
          </el-tooltip>
        </span>
        <span class="gy-edit-tool-left">
          <el-tooltip class="item" effect="dark" content="下划线" placement="bottom">
            <button class="fa fa-underline gy-edit-tool-btn" type="text" @click="onToolBtnUnderline"></button>
          </el-tooltip>
        </span>
        <span class="gy-edit-tool-left">
          <el-tooltip class="item" effect="dark" content="删除线" placement="bottom">
            <button class="fa fa-strikethrough gy-edit-tool-btn" type="text" @click="onToolBtnStrikethrough"></button>
          </el-tooltip>
        </span>
        <span class="gy-edit-tool-left">
          <el-tooltip class="item" effect="dark" content="标题" placement="bottom">
            <button class="fa fa-header gy-edit-tool-btn" type="text" @click="onToolBtnHeader($event)"></button>
          </el-tooltip>
        </span>
        <span class="gy-edit-tool-left">
          <el-tooltip class="item" effect="dark" content="无序列表" placement="bottom">
            <button class="fa fa-list-ul gy-edit-tool-btn" type="text" @click="onToolBtnListUl"></button>
          </el-tooltip>
        </span>
        <span class="gy-edit-tool-left">
          <el-tooltip class="item" effect="dark" content="有序列表" placement="bottom">
            <button class="fa fa-list-ol gy-edit-tool-btn" type="text" @click="onToolBtnListOl"></button>
          </el-tooltip>
        </span>
        <span class="gy-edit-tool-left">
          <el-tooltip class="item" effect="dark" content="引用" placement="bottom">
            <button class="fa fa-quote-left gy-edit-tool-btn" type="text" @click="onToolBtnQuoteleft"></button>
          </el-tooltip>
        </span>
        <span class="gy-edit-tool-left">
          <el-tooltip class="item" effect="dark" content="分割线" placement="bottom">
            <button class="fa fa-minus gy-edit-tool-btn" type="text" @click="onToolBtnSplitLine"></button>
          </el-tooltip>
        </span>
        <span class="gy-edit-tool-left">
          <el-tooltip class="item" effect="dark" content="链接" placement="bottom">
            <button class="fa fa-link gy-edit-tool-btn" type="text" @click="inputLinkDialogVisible = true"></button>
          </el-tooltip>
        </span>
      </div>
      <codemirror
        ref="editor"
        :code="code"
        :options="editorOptions"
        @input="onEditorCodeChange"
        @paste="onPaste"
        @drop="onDrop"
        @scroll="onScroll"
        v-bind:style="{ 'width': previewLeft - editsplitLeft - 4 + 'px'}"
      />
      <div class="gy-previewsplit-div" v-bind:style="{ 'left': previewLeft + 'px'}" @pointerdown="onMouseDown" @pointerup="onMouseUp"></div>  
      <div class="gy-edit-preview markdown-body" v-bind:style="{ 'left': previewLeft + 4 + 'px'}" v-html="inputhtml"></div>
      <div v-if=isBackTopVisible class="gy-back-top fa fa-arrow-up" @click="onBackTop"></div>
    </div>
    <gy-menu :menus="filelistmenus" @click-menu="onClickFileListMenu"></gy-menu>
    <gy-menu :menus="headermenus" @click-menu="onClickHeaderMenu"></gy-menu>
    <el-dialog title="添加链接" :visible.sync="inputLinkDialogVisible" width="30%">
      <el-form label-width="80px" :model="formLinkInfo">
        <el-form-item label="链接地址">
          <el-input v-model="formLinkInfo.address"></el-input>
        </el-form-item>
        <el-form-item label="链接标题">
          <el-input v-model="formLinkInfo.title"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="inputLinkDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="onInputLink">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import editorOptions from '@/scripts/editor.js'
  import { debounce } from 'lodash'
  import { compiledMarkdown } from '@/scripts/markdown.js'
  import _markdownRender from '@/scripts/markdown/markdown.render.js'
  import mermaid from 'mermaid'
  import { mapState } from 'vuex'
  import ComponentMenu from './common/Menu'

  const _configHelper = require('../scripts/bookmanager.js')

  // 左侧工具栏（文件、大纲）
  var ComponentFileListBar = {
    props: ['barwidth', 'outlinehtml'],
    template: `
      <div class="gy-edit-filelistbar-div">
        <div class="gy-edit-filelistbartab-div">
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
        <div v-if="name === 'files'" class="gy-edit-filelistbarpanel-div">
          <div class="gy-files-top-div">
            <span class="fa fa-folder"></span>
            <input type="text" readonly='readonly' unselectable='on' :value="currentSelectBookName" :title="currentSelectBookName"/>
            <button class="el-icon-plus gy-addfile-btn" title="新建文件" @click="onAddFile()"></button>
          </div>
          <div class="gy-files-list-div" :style="{ width: barwidth + 'px' }">
            <div v-for="(file, index) in files" :key="file.name">
              <div class="gy-filename-div" :class="{ 'gy-filename-div-active': fileindex === index }" :index=index @click="onClickFileName(index)" @contextmenu="onShowMenu(index, $event)">
                <span class="fa fa-file-text-o"></span>
                <input type="text" class="gy-filename-input" :value="file.name" :readonly="file.rename ? false : 'readonly'" :unselectable="file.rename ? false : 'on'" @dblclick="onDbclickFilename(index)" @blur="onBlueFilename(file.name, index , $event)"/>
              </div>
            </div>
          </div>
        </div>
        <div v-if="name === 'outline'" class="gy-edit-filelistbarpanel-div" v-html="outlinehtml">
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
        this.$store.dispatch('setCurrentSelectBookFile', this.files[index].name)
      },
      onShowMenu: function (index, event) {
        this.$emit('show-menu', index, event)
      },
      onClickFileListMenu: function (index, name, userdata) {
        console.log('onClickFileListMenu 删除文件', name, userdata)
        switch (name) {
          case '打开':
            this.onClickFileName(userdata)
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
        fileListBarWidth: 200,
        previewLeft: 800,
        isBackTopVisible: false,
        code: '',
        inputhtml: '',
        outlinehtml: '',
        editorOptions,
        isScrollPreviewDiv: false,
        arrayScrollFlags: [],
        filelistmenus: {visible: false, left: 200, top: 200, items: ['删除'], userdata: 1},
        headermenus: {visible: false, left: 200, top: 200, items: ['一级标题', '二级标题', '三级标题', '四级标题', '五级标题', '六级标题'], userdata: 1},
        inputLinkDialogVisible: false,
        formLinkInfo: {
          address: '',
          title: ''
        }
      }
    },
    updated: function () {
      // 页面内容更新后，重新渲染mermaid图表
      mermaid.init(undefined, '.mermaid')
      // 更新显示返回顶部按钮
      let elem = document.querySelector('.gy-edit-preview')
      if (elem && elem.scrollHeight > elem.offsetHeight) {
        this.isBackTopVisible = true
      } else {
        this.isBackTopVisible = false
      }
      // 构建滚动条索引表
      let arrayFlags = document.querySelectorAll('.gy-edit-preview [source-line]')
      let self = this
      arrayFlags.forEach(function (item) {
        let info = {
          sourceLine: parseInt(item.getAttribute('source-line')),
          previewScrollTop: item.offsetTop
        }
        if (info.sourceLine !== 0) {
          self.arrayScrollFlags.push(info)
        }
      })
    },
    components: {
      'gy-edit-filelistbar': ComponentFileListBar,
      'gy-menu': ComponentMenu
    },
    created: function () {
      this.$store.dispatch('showStatusBar', true)
      this.$store.dispatch('showFileListBar', true)
      this.$store.dispatch('setFileListBarWidth', this.fileListBarWidth)
    },
    mounted () {
      // 监听预览区scroll事件，同步滚动
      let self = this
      let elem = document.querySelector('.gy-edit-preview')
      if (elem) {
        elem.addEventListener('mouseenter', function (e) {
          self.isScrollPreviewDiv = true
        })

        elem.addEventListener('mouseleave', function (e) {
          self.isScrollPreviewDiv = false
        })

        elem.addEventListener('scroll', function (e) {
          if (self.isScrollPreviewDiv) {
            let indexFlag = self.arrayScrollFlags.findIndex((item) => item.previewScrollTop >= e.target.scrollTop)
            if (indexFlag !== -1) {
              let totalHeight = 0
              for (let i = 0, len = self.arrayScrollFlags[indexFlag].sourceLine - 1; i < len; ++i) {
                totalHeight += self.codemirror.getLineHandle(i).height
              }
              self.codemirror.scrollTo(0, totalHeight)
            }
          }
        })
      }
    },
    watch: {
      currentSelectBookFile: function (data) {
        this.openFile(data)
      }
    },
    computed: {
      codemirror () {
        return this.$refs.editor.codemirror
      },
      editsplitLeft () {
        return this.fileListBarWidth + this.leftToolBarWidth
      },
      editMarginLeft () {
        return this.editsplitLeft + 4 - this.leftToolBarWidth
      },
      ...mapState({
        leftToolBarWidth: state => state.UIStore.leftToolBarWidth,
        showFileListBar: state => state.UIStore.showFileListBar,
        // currentSelectBookName: state => state.DataStore.currentSelectBook.name,
        currentSelectBookPath: state => state.DataStore.currentSelectBook.path,
        currentSelectBookFile: state => state.DataStore.currentSelectBook.file
      })
    },
    methods: {
      onMouseDown: function (event) {
        if (event.target.className === 'gy-editsplit-div') {
          let dx = this.fileListBarWidth - event.clientX
          event.target.setPointerCapture(event.pointerId)
          event.target.onpointermove = (ev) => {
            this.fileListBarWidth = ev.clientX + dx
            if (this.fileListBarWidth < 100) {
              this.fileListBarWidth = 100
            }

            if (this.fileListBarWidth > 500) {
              this.fileListBarWidth = 500
            }

            this.$store.dispatch('setFileListBarWidth', this.fileListBarWidth)
          }
        } else if (event.target.className === 'gy-previewsplit-div') {
          let dx = this.previewLeft - event.clientX
          event.target.setPointerCapture(event.pointerId)
          event.target.onpointermove = (ev) => {
            this.previewLeft = ev.clientX + dx

            let minLeft = this.showFileListBar ? 200 + this.editsplitLeft : 200 + this.leftToolBarWidth
            let maxLeft = document.body.clientWidth - 200
            if (this.previewLeft < minLeft) {
              this.previewLeft = minLeft
            }

            if (this.previewLeft > maxLeft) {
              this.previewLeft = maxLeft
            }
            // this.$store.dispatch('setFileListBarWidth', this.fileListBarWidth)
          }
        }
      },
      onMouseUp: function (event) {
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
        this.filelistmenus = menuInfo
      },
      onClickFileListMenu: function (index, name, userdata) {
        this.filelistmenus = {visible: false}
        this.$refs.filelistbar.onClickFileListMenu(index, name, userdata)
      },
      onClickHeaderMenu: function (index, name, userdata) {
        let strFlag = '#'
        strFlag = strFlag.repeat(index + 1)
        let selection = this.codemirror.getSelection()
        this.codemirror.replaceSelection(`${strFlag} ${selection}`)
        this.headermenus.visible = false
      },
      onEditorCodeChange: debounce(function (newCode) {
        this.code = newCode
        let workspace = _configHelper.getWorkspace().workspace
        if (workspace !== '') {
          this.inputhtml = compiledMarkdown(newCode, workspace)
          this.outlinehtml = _markdownRender.getOutline()
        } else {
          console.error('compiledMarkdown failed, worksapce is null')
        }
      }, 200),
      onPaste: function (cm, e) {
        let self = this
        for (let i = 0, len = e.clipboardData.items.length; i < len; i++) {
          if (e.clipboardData.items[i].kind === 'file' && e.clipboardData.items[i].type.indexOf('image') !== -1) {
            let pasteFile = e.clipboardData.items[i].getAsFile()
            let reader = new FileReader()
            reader.onloadend = function (event) {
              let imgBase64 = event.target.result
              let res = _configHelper.pasteImageFile(imgBase64)
              if (res !== '') {
                self.codemirror.replaceSelection(`![image](${res})`)
              } else {
                window.showError('图片粘贴失败，请重试！')
              }
            }
            reader.readAsDataURL(pasteFile)
          }
        }
      },
      onDrop: function (cm, e) {
        let self = this
        for (let i = 0, len = e.dataTransfer.files.length; i < len; i++) {
          if (e.dataTransfer.files[i].type.indexOf('image') !== -1) {
            let res = _configHelper.copyImageFile(e.dataTransfer.files[i].path)
            if (res !== '') {
              self.codemirror.replaceSelection(`![image](${res})`)
            } else {
              window.showError('图片拖拽失败，请重试！')
            }
          }
        }
      },
      onScroll: function (cm) {
        if (this.isScrollPreviewDiv) {
          return
        }

        try {
          // 计算当前顶端行号，同步滚动
          let currentLine = 0
          let scrollInfo = cm.getScrollInfo()
          let offsetHeight = scrollInfo.top - 4 - cm.getLineHandle(currentLine).height
          while (offsetHeight > 0) {
            ++currentLine
            offsetHeight -= cm.getLineHandle(currentLine).height
          }

          let indexFlag = this.arrayScrollFlags.findIndex((item) => item.sourceLine >= (currentLine + 1))
          if (indexFlag !== -1) {
            document.querySelector('.gy-edit-preview').scrollTop = this.arrayScrollFlags[indexFlag].previewScrollTop
          }
        } catch (e) {
        }
      },
      onToolBtnBold: function () {
        let selection = this.codemirror.getSelection()
        this.codemirror.replaceSelection(`**${selection}**`)
      },
      onToolBtnItalic: function () {
        let selection = this.codemirror.getSelection()
        this.codemirror.replaceSelection(`*${selection}*`)
      },
      onToolBtnUnderline: function () {
        let selection = this.codemirror.getSelection()
        this.codemirror.replaceSelection(`++${selection}++`)
      },
      onToolBtnStrikethrough: function () {
        let selection = this.codemirror.getSelection()
        this.codemirror.replaceSelection(`~~${selection}~~`)
      },
      onToolBtnHeader: function (event) {
        this.headermenus.left = event.clientX
        this.headermenus.top = event.clientY
        this.headermenus.visible = true
      },
      onToolBtnListUl: function () {
        let selection = this.codemirror.getSelection()
        this.codemirror.replaceSelection(`- ${selection}`)
      },
      onToolBtnListOl: function () {
        let selection = this.codemirror.getSelection()
        this.codemirror.replaceSelection(`1. ${selection}`)
      },
      onToolBtnQuoteleft: function () {
        let selection = this.codemirror.getSelection()
        this.codemirror.replaceSelection(`> ${selection}`)
      },
      onToolBtnSplitLine: function () {
        let selection = this.codemirror.getSelection()
        this.codemirror.replaceSelection(`\n---\n${selection}`)
      },
      onInputLink: function () {
        this.inputLinkDialogVisible = false
        console.log(this.formLinkInfo.address)
        console.log(this.formLinkInfo.title)
        this.codemirror.replaceSelection(`[${this.formLinkInfo.title}](${this.formLinkInfo.address})`)
        this.formLinkInfo.address = ''
        this.formLinkInfo.title = ''
      },
      onSave: function () {
        console.log('onSave')
        const self = this
        console.log('save file:', self.currentSelectBookPath + '/' + self.currentSelectBookFile)
        console.log('save file content:', self.code)
        _configHelper.writeMdFile(self.currentSelectBookPath, self.currentSelectBookFile, self.code, function (err) {
          if (err !== null) {
            window.showError(`文件[${self.currentSelectBookFile}]写入失败！`)
          } else {
            window.showSuccess(`文件[${self.currentSelectBookFile}]保存成功！`)
          }
        })
      },
      openFile: function (name) {
        const self = this
        // todo:保存现有编辑文件，或者提示

        console.log('open file:', self.currentSelectBookPath + '/' + name)
        _configHelper.readMdFile(self.currentSelectBookPath, name, function (err, content) {
          if (err === null) {
            self.code = `${content}`
            console.log('open file result:', content)
          } else {
            window.showError(`文件[${name}]读取失败！`)
          }
        })
      },
      onBackTop: function () {
        document.querySelector('.gy-edit-preview').scrollTop = 0
        this.codemirror.scrollTo(0, 0)
      }
    }
  }
</script>

<style>
  #gy_edit_component {
    /* float: left;
    width: 100%;
    height: calc(100vh - 78px);
    background: tomato; */
  }

  .gy-filelistbar-div {
    width: 196px;
    height: calc(100vh - 52px);
    /* background: cornflowerblue; */
    overflow-y: auto;
    position: fixed;
  }

  .gy-editsplit-div {
    /* background: cornflowerblue; */
    left: 196px;
    border-left: 1px solid #EDEDED;
    width: 3px;
    height: calc(100vh - 52px);
    position: fixed;
    cursor: w-resize;
  }

  .gy-editcontainer-div {
    margin-left: 200px;
    background-color: greenyellow;
  }

  /* 
  .gy-editcontainer-div footer {
    position:fixed;
    bottom:0px;
    width:100%;
    height:50px;
  } */

  .gy-edit-filelistbartab-div {
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

  .gy-files-top-div {
    padding: 5px 2px 5px 2px;
    white-space: nowrap;
    color: rgb(119, 119, 119)
  }

  .gy-files-list-div {
    width: 196px;
    height: calc(100vh - 142px);
    /*background: tomato;*/
    overflow-y: auto;
    position: fixed;
  }

  .gy-files-top-div input{
    width: calc(100% - 52px);
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    border: 0px;
    outline: -webkit-focus-ring-color auto 5px;
    outline-offset: -2px;
    border: 0px;
    outline: none;
    cursor: default;
    user-select: none;
  }
  
  .gy-filename-div {
    padding: 5px 10px 5px 10px;
    white-space: nowrap;
    color: rgb(119, 119, 119);
    font-size: 14px;
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
    width: calc(100% - 6px);
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
    margin-right: 0px;
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

  .gy-edit-filelistbarpanel-div ul {
    padding: 0px;
    margin: 0px;
  }

  .gy-toc-li {
    padding: 0px;
    margin: 0px;
    height: 28px;
    line-height: 28px;
  }

  .gy-toc-li:hover {
    background-color: rgb(248,248,248);
  }

  .gy-toc-li a {
    padding: 0px 4px 0px 8px;
    text-decoration:none;
    display: flex;
    display: block;
    justify-content: center;
    align-items: center;
    color: rgb(119, 119, 119);
  }

  .gy-toc-li a:hover{
    text-decoration:none;
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

  .gy-edit-tool {
    height: 32px;
    background: rgb(235, 238, 240);
  }

  .gy-edit-tool-btn {
    margin: 0px 1px 0px 0px;
    width: 28px;
    height: 32px;
    background-color: rgb(235, 238, 240);
    color: rgba(119, 119, 119, 1);
    border: 0px;
  }

  .gy-edit-tool-btn:hover {
    color: rgba(119, 119, 119, 0.8);
    background-color: rgb(247, 247, 247);;
  }

  .vue-codemirror {
    background-color: rgb(59, 174, 250);
    font-size: 18px;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    color: #606266;
    /* max-width: 800px;
    position: relative;
    margin: 0 auto;*/
    width: auto;
    height: calc(100vh - 110px);
    overflow-y: auto;
    position: fixed;
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

  .gy-previewsplit-div {
    /* background: cornflowerblue; */
    left: 596px;
    border-left: 1px solid #EDEDED;
    width: 3px;
    height: calc(100vh - 110px);
    position: fixed;
    cursor: w-resize;
  }

  .gy-edit-preview {
    right: 0px;
    width: auto;
    height: calc(100vh - 110px);
    overflow-y: auto;
    overflow-x: auto;
    position: fixed;
  }

  .gy-back-top {
    position: fixed;
    bottom: 30px;
    right: 10px;
    background-color: #409EFF;
    width: 40px;
    height: 40px;
    border-radius: 6px;
    text-align: center;
    line-height: 40px;
    font-size: 24px;
    color: #fff;
  }

  .gy-back-top:hover {
    background-color: red;
  }

  .gy-markdown-tip {
    font-family: 'Helvetica Neue',Helvetica,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',SimSun,sans-serif;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    font-size: 14px;
    color: #5e6d82;
    line-height: 1.5em;
    padding: 8px 16px;
    border-radius: 4px;
    margin: 20px 0;
  }

  .gy-markdown-tip.tip1 {
    background-color: #ecf5ff;
    border-left: #409EFF 5px solid;
  }

  .gy-markdown-tip.tip2 {
    background-color: #f0f9eb;
    border-left: #67c23a 5px solid;
  }

  .gy-markdown-tip.tip3 {
    background-color: #f4f4f5;
    border-left: #909399 5px solid;
  }

  .gy-markdown-tip.tip4 {
    background-color: #fdf6ec;
    border-left: #e6a23c 5px solid;
  }

  .gy-markdown-tip.tip5 {
    background-color: #fef0f0;
    border-left: #f56c6c 5px solid;
  }

  .gy-footnotes-div hr {
    border: 0;
    border-bottom: 1px dashed #cfcfcf;
    background-color: white;
    margin: 4px 0;
  }

  .gy-footnotes-div a {
    color: #08c;
    text-decoration: none;
  }
</style>
