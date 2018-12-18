<template>
  <div id="books">
    <div v-if="workspace === ''" class="gy-selectworkspace-div">
      <el-button type="primary" icon="el-icon-document" @click="onSelectWorkSpace">选择工作目录</el-button>
      <p>良好的文档管理，从设置工作目录开始~</p>
    </div>
    <gy-bookbox v-else v-for="(bookbox, index) in bookboxs" :key="index" :bookbox="bookbox" :boxindex="index" @click-book="onBookClick" @delete-book="onBookDelete" @dbclick-bookname="onBookNameDbClick" @blur-bookname="onBookNameBlur" @dbclick-boxname="onBoxNameDbClick"
      @blur-boxname="onBoxNameBlur" @add-box="onAddBookbox" @delete-box="onDeleteBookbox"></gy-bookbox>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  const _configHelper = require('../scripts/bookmanager.js')

  var ComponentBookList = {
    props: ['bookinfo', 'bookindex'],
    template: `
      <div class="gy-bookinfo-div">
        <el-button v-if="bookinfo.name !== '新增书籍'" @click="$emit('delete-book', bookinfo.name, bookindex)" type="danger" icon="el-icon-delete" size="mini" circle></el-button>
        <img :src="bookinfo.icon" @click="$emit('click-book', bookinfo.name, bookindex)">
        <input v-if="bookinfo.name !== '新增书籍'" type="text" class="gy-bookname-input" :readonly="bookinfo.rename ? false : 'readonly'" :unselectable="bookinfo.rename ? false : 'on'" :onfocus="bookinfo.rename ? '' : 'this.blur()'"  @dblclick="$emit('dbclick-bookname', bookindex)" @blur="$emit('blur-bookname', bookinfo.name, bookindex , $event)" :value="bookinfo.name"/>
        <input v-else type="text" class="gy-bookname-input" readonly='readonly' unselectable='on' onfocus='this.blur()' :value="bookinfo.name" />
      </div>
    `
  }

  var ComponentBookBox = {
    props: ['bookbox', 'boxindex'],
    template: `
      <div class="gy-bookbox-div">
        <div class="gy-bookbox-topbar">
          <span class="el-icon-menu"></span>
          <input type="text" class="gy-boxname-input" :value="bookbox.name" :readonly="bookbox.rename ? false : 'readonly'" :unselectable="bookbox.rename ? false : 'on'" :onfocus="bookbox.rename ? '' : 'this.blur()'" @dblclick="$emit('dbclick-boxname', boxindex)" @blur="$emit('blur-boxname', bookbox.name, boxindex , $event)" />
          <el-button v-if="bookbox.name !== '待整理'" type="info" plain icon="el-icon-delete" size="mini" @click="$emit('delete-box', boxindex, bookbox.name)">删除</el-button>
          <el-button type="info" plain icon="el-icon-plus" size="mini" @click="$emit('add-box', boxindex)">新增</el-button>
        </div>
        <gy-booklist v-for="(bookItem, index) in bookbox.books" :key="bookItem.name" :bookindex="index" :bookinfo="bookItem" @dbclick-bookname="onBookNameDbClick" @blur-bookname="onBookNameBlur" @click-book="onBookClick" @delete-book="onBookDelete"></gy-booklist>
      </div>
    `,
    components: {
      'gy-booklist': ComponentBookList
    },
    methods: {
      onBookClick (bookname, bookindex) {
        this.$emit('click-book', this.boxindex, bookname, bookindex)
      },
      onBookDelete (bookname, bookindex) {
        this.$emit('delete-book', this.boxindex, bookname, bookindex)
      },
      onBookNameDbClick (bookindex) {
        this.$emit('dbclick-bookname', this.boxindex, bookindex)
      },
      onBookNameBlur (bookname, bookindex, e) {
        this.$emit('blur-bookname', this.boxindex, bookname, bookindex, e)
      }
    }
  }

  const _addBookDefaultItem = {name: '新增书籍', icon: './static/images/addbook.png', rename: false}

  export default {
    data: function () {
      return {
        bookboxs: []
      }
    },
    components: {
      'gy-bookbox': ComponentBookBox
    },
    created: function () {
      let response = _configHelper.getWorkspace()
      console.log('BooksPage.vue created >> getWorkspace', response)
      this.setWorkspacePath(response)
    },
    methods: {
      setWorkspacePath (response) {
        this.$store.dispatch('updateWorkspacePath', response.workspace)
        this.bookboxs.splice(0)
        try {
          for (let i = 0; i < response.bookboxs.length; i++) {
            response.bookboxs[i].books.push(_addBookDefaultItem)
            this.bookboxs.push(response.bookboxs[i])
          }
        } catch (e) {
          console.log(e)
        }
      },
      onSelectWorkSpace () {
        const self = this
        const remote = this.$electron.remote
        const dialog = remote.dialog

        dialog.showOpenDialog({
          properties: ['openFile', 'openDirectory']
        }, function (files) {
          try {
            if (files && files.length > 0) {
              let response = _configHelper.changeWorkspace(files[0])
              console.log('selectWorkSpace Dialog finished' >> response)
              self.setWorkspacePath(response)
            }
          } catch (e) {
            if (e.errno === -4048) {
              console.log(e)
              window.showError('没有权限操作此文件夹，请以管理员权限运行程序或更换目录！')
            } else {
              console.log(e)
              window.showError('工作目录打开失败，请尝试其他目录！')
            }
          }
        })
      },
      onAddBookbox (boxindex) {
        // 自增命名新分类
        let nIndex = 1
        let newBoxName = `新分类${nIndex}`
        while (this.isExistBox(newBoxName)) {
          ++nIndex
          newBoxName = `新分类${nIndex}`
        }

        let paramJson = { 'boxName': newBoxName, 'boxIndex': boxindex }
        try {
          _configHelper.addBookbox(paramJson)
          let newValue = {
            name: paramJson.boxName,
            rename: true,
            books: [_addBookDefaultItem]
          }
          this.bookboxs.splice(paramJson.boxIndex, 0, newValue)
        } catch (e) {
          console.log(e)
          window.showError('操作失败，请重试！')
        }
      },
      onDeleteBookbox (boxindex, boxname) {
        this.$confirm('是否永久删除分类[' + boxname + ']？', '确认信息', {
          distinguishCancelAndClose: true,
          confirmButtonText: '仅删除分类',
          cancelButtonText: '同时删除书籍',
          type: 'warning'
        }).then(() => {
          let paramJson = {
            'boxName': boxname,
            'boxIndex': boxindex,
            'type': 0
          }
          console.log(paramJson)
          try {
            _configHelper.deleteBookbox(paramJson)

            // 将删除的book数据添加到待整理，需要考虑同名的情况
            let defaultIndex = this.bookboxs.length - 1
            if (defaultIndex > -1) {
              let defaultBooks = this.bookboxs[defaultIndex].books
              let tempBooks = this.bookboxs[paramJson.boxIndex].books
              tempBooks.forEach((item) => {
                if (item.name === '新增书籍') {
                  return
                }

                let nIndex = 1
                let newBookName = `${item.name}(${nIndex})`
                while (this.isExistBook(defaultIndex, newBookName)) {
                  ++nIndex
                  newBookName = `${item.name}(${nIndex})`
                }

                let addItem = {
                  icon: './static/images/icon.png',
                  name: newBookName,
                  rename: false
                }

                defaultBooks.splice(defaultBooks.length - 1, 0, addItem)
              })
            }

            this.bookboxs.splice(paramJson.boxIndex, 1)
            this.$message({
              type: 'success',
              message: '分类[' + paramJson.boxName + ']删除成功，内部书籍已移动到[待整理]'
            })
          } catch (e) {
            window.showError('删除分类操作失败，请重试！')
          }
        }).catch(action => {
          if (action === 'cancel') {
            let paramJson = {
              'operation': 'deleteBookbox',
              'boxName': boxname,
              'boxIndex': boxindex,
              'type': 1
            }
            try {
              _configHelper.deleteBookbox(paramJson)

              this.bookboxs.splice(paramJson.boxIndex, 1)
              this.$message({
                type: 'success',
                message: '分类[' + boxname + ']及内部书籍删除成功'
              })
            } catch (e) {
              window.showError('删除分类操作失败，请重试！')
            }
          }
        })
      },
      onBoxNameDbClick (boxindex) {
        let newValue = this.bookboxs[boxindex]
        if (newValue.name === '待整理') {
          return
        }

        newValue.rename = true
        this.bookboxs.splice(boxindex, 1, newValue)
      },
      onBoxNameBlur (boxname, boxindex, e) {
        let newName = e.target.value
        if (boxname !== newName && this.isExistBox(newName)) {
          window.showError('类型名已存在，请重新修改！')
          return
        }

        try {
          let paramJson = {
            'operation': 'modifyBookbox',
            'boxName': newName,
            'boxIndex': boxindex
          }
          _configHelper.modifyBookbox(paramJson)

          let newValue = this.bookboxs[paramJson.boxIndex]
          newValue.name = paramJson.boxName
          newValue.rename = false
          this.bookboxs.splice(paramJson.boxIndex, 1, newValue)
        } catch (e) {
          console.log(e)
          window.showError('重命名操作失败，请重试！')
        }
      },
      onBookClick (boxindex, bookname, bookindex) {
        if (bookname !== '新增书籍') {
          alert(bookname)
        } else {
          let nIndex = 1
          let newBookName = `新书籍${nIndex}`
          while (this.isExistBook(boxindex, newBookName)) {
            ++nIndex
            newBookName = `新书籍${nIndex}`
          }

          try {
            let paramJson = {
              'operation': 'addBook',
              'boxIndex': boxindex,
              'bookName': newBookName,
              'bookIndex': bookindex
            }
            _configHelper.addBook(paramJson)

            let newValue = {
              icon: './static/images/icon.png',
              name: paramJson.bookName,
              rename: true
            }
            this.bookboxs[paramJson.boxIndex].books.splice(paramJson.bookIndex, 0, newValue)
          } catch (e) {
            console.log(e)
            window.showError('新增书籍操作失败，请重试！')
          }
        }
      },
      onBookDelete (boxindex, bookname, bookindex) {
        this.$confirm('是否永久删除书籍[' + bookname + ']？', '确认信息', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          try {
            let paramJson = {
              'operation': 'deleteBook',
              'boxIndex': boxindex,
              'bookName': bookname,
              'bookIndex': bookindex
            }
            _configHelper.deleteBook(paramJson)

            this.bookboxs[paramJson.boxIndex].books.splice(paramJson.bookIndex, 1)
            this.$message({
              type: 'success',
              message: '书籍[' + paramJson.bookName + ']删除成功'
            })
          } catch (e) {
            console.log(e)
            window.showError('新增书籍操作失败，请重试！')
          }
        }).catch(action => {
        })
      },
      onBookNameDbClick (boxindex, bookindex) {
        let newValue = this.bookboxs[boxindex].books[bookindex]
        newValue.rename = true
        this.bookboxs[boxindex].books.splice(bookindex, 1, newValue)
      },
      onBookNameBlur (boxindex, bookname, bookindex, e) {
        let newName = e.target.value
        if (bookname !== newName && this.isExistBook(boxindex, newName)) {
          alert('文件名已存在，请重新修改！')
        } else {
          try {
            let paramJson = {
              'operation': 'modifyBook',
              'boxIndex': boxindex,
              'bookName': newName,
              'bookIndex': bookindex
            }
            _configHelper.modifyBook(paramJson)

            let newValue = this.bookboxs[paramJson.boxIndex].books[paramJson.bookIndex]
            newValue.name = paramJson.bookName
            newValue.rename = false
            this.bookboxs[paramJson.boxIndex].books.splice(paramJson.bookIndex, 1, newValue)
          } catch (e) {
            console.log(e)
            window.showError('新增书籍操作失败，请重试！')
          }
        }
      },
      isExistBox (boxname) {
        for (let i = 0; i < this.bookboxs.length; i++) {
          if (this.bookboxs[i].name === boxname) {
            return true
          }
        }
        return false
      },
      isExistBook (boxindex, bookname) {
        for (let i = 0; i < this.bookboxs[boxindex].books.length; i++) {
          if (this.bookboxs[boxindex].books[i].name === bookname) {
            return true
          }
        }
        return false
      }
    },
    computed: mapState({
      workspace: state => state.Data.workspacePath
    })
  }
</script>

<style>
  #books {
    float: left;
    width: 100%;
  }

  .gy-selectworkspace-div {
    position: fixed;
    margin: auto;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 240px;
    height: 200px;
    text-align: center;
  }

  .gy-selectworkspace-div .el-button {
    font-size: 22px;
  }
  
  .gy-selectworkspace-div p {
    font-size: 13px;
    color: #C0C4CC;
  }

  .gy-bookbox-div,
  .gy-boxname-input {
    font-size: 22px;
  }
        
  .gy-bookbox-topbar {
    background-color: rgb(235, 238, 240);
    width: 100%;
  }
        
  .gy-bookbox-topbar .el-button {
    float: right;
    margin-left: 4px;
  }
        
  .gy-bookinfo-div {
    border: 1px solid #FFF;
    display: inline-block;
    margin: 8px;
    padding: 10px;
    width: 80px;
    position: relative;
  }
  
  .gy-bookinfo-div:hover {
    border: 1px solid rgb(235, 238, 240);
    cursor: pointer;
  }
  
  .gy-bookinfo-div img {
    width: 80px;
    height: 80px;
  }
  
  .gy-bookinfo-div .el-button {
    position: absolute;
    right: 0px;
    top: 0px;
  }
  
  .gy-bookname-input {
    width: 76px;
    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  
  .gy-boxname-input[readonly],
  .gy-bookname-input[readonly] {
    border: 0px;
    outline: none;
    cursor: pointer;
    user-select: none;
  }
  
  .gy-boxname-input[readonly] {
    background-color: rgb(235, 238, 240);
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
</style>
