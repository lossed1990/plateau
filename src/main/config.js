'use strict'
var _config = require('../config/config.json')
const _path = require('path')
const _fs = require('fs')

function ConfigHelper () {}

var _workspace = ''
var _booksConfig

//= =====全局配置文件相关操作======
/**
 * 获取工作目录及书架配置信息
 *
 * - config.json中不存在workspace字段：返回空数据；
 * - config.json中存在workspace字段：
 *   - 验证字段所在目录是否存在，不存在，清空workspace字段；
 */
ConfigHelper.prototype.getWorkspace = function () {
  if (!_config.workspace) {
    return { workspace: '', bookboxs: [] }
  }

  if (!_fs.existsSync(_config.workspace)) {
    this.saveWorkspace('')
    return { workspace: '', bookboxs: [] }
  }

  return this.changeWorkspace(_config.workspace)
}

/**
 * 改变工作目录
 *
 * - 验证是否包含.plateau文件夹和books.json文件；新建.plateau文件夹、初始化books.json文件，返回空数据；
 * - 读取books.json文件内容，构造数据并返回；
 */
ConfigHelper.prototype.changeWorkspace = function (path) {
  this.saveWorkspace(path)

  let configPath = path + '/.plateau/data.json'
  if (!_fs.existsSync(configPath)) {
    this.initDataConfig(configPath)
    return { workspace: path, bookboxs: this.getDefaultBookbox() }
  }

  try {
    _booksConfig = require(configPath)
    let workspaceInfo = { workspace: path, bookboxs: [] }
    for (let i = 0, len = _booksConfig.bookboxs.length; i < len; i++) {
      let itemBookbox = {
        name: _booksConfig.bookboxs[i].name,
        rename: false,
        books: []
      }
      for (let j = 0, len1 = _booksConfig.bookboxs[i].books.length; j < len1; j++) {
        let itemBook = {
          icon: '../assets/images/icon.png',
          name: _booksConfig.bookboxs[i].books[j],
          rename: false
        }
        itemBookbox.books.push(itemBook)
      }
      workspaceInfo.bookboxs.push(itemBookbox)
    }
    return workspaceInfo
  } catch (e) {
    this.initDataConfig(configPath)
    return { workspace: path, bookboxs: this.getDefaultBookbox() }
  }
}

/**
 * 保存工作目录
 * @param {String} path
 */
ConfigHelper.prototype.saveWorkspace = function (path) {
  // 初始话工作目录
  if (path !== '') {
    this.iniWorkspace(path)
  }

  let configPath = _path.join(__dirname, '../config/config.json')
  _config.workspace = path
  _workspace = path
  _fs.writeFileSync(configPath, JSON.stringify(_config))
}

//= =====工作目录配置文件及内部文件夹的相关操作======
/**
 * 获取默认书架配置信息
 *
 * 默认书架包含一个“待整理”分类
 */
ConfigHelper.prototype.getDefaultBookbox = function () {
  return [{
    'name': '待整理',
    'rename': false,
    'books': []
  }]
}

/**
 * 初始化工作目录数据
 */
ConfigHelper.prototype.initDataConfig = function (configpath) {
  _booksConfig = {
    'bookboxs': [{
      'name': '待整理',
      'books': []
    }]
  }
  _fs.writeFileSync(configpath, JSON.stringify(_booksConfig))
}

/**
 * 初始化工作目录
 * @param {String} path
 */
ConfigHelper.prototype.iniWorkspace = function (path) {
  let configPath = path + '/.plateau/'
  // 新工作区，初始化
  if (!_fs.existsSync(configPath)) {
    _fs.mkdirSync(configPath)
    _fs.mkdirSync(configPath + 'back/')

    this.initDataConfig(configPath + 'data.json')
  }
}

ConfigHelper.prototype.updateBookData = function (param) {
  try {
    let paramJson = JSON.parse(param)
    if (typeof (eval('this.' + paramJson.operation)) === 'function') {
      let script = 'this.' + paramJson.operation + '(' + param + ')'
      eval(script)
      return true
    }
    return false
  } catch (e) {
    return false
  }
}

ConfigHelper.prototype.excuteUpdateBookData = function (func, param) {
  if (_booksConfig === undefined) {
    throw new Error('_booksConfig is undefined')
  }

  let configPath = _workspace + '/.plateau/data.json'
  if (!_fs.existsSync(configPath)) {
    throw new Error('data.json is not exist')
  }

  func(param)

  _fs.writeFileSync(configPath, JSON.stringify(_booksConfig))
}

/**
 * 新增书架类型
 * @param {String} name
 * @param {int} index
 */
ConfigHelper.prototype.addBookbox = function (param) {
  this.excuteUpdateBookData(function (param) {
    // 新建对应的文件夹
    _fs.mkdirSync(_workspace + '/' + param.boxName + '/')

    // 更新配置文件
    let newValue = {
      'name': param.boxName,
      'books': []
    }
    _booksConfig.bookboxs.splice(param.box_index, 0, newValue)
  }, param)
}

/**
 * 删除书架类型
 * @param {String} name
 * @param {int} index
 * @param {int} type 删除方式 0:移动到待整理文件夹; 1:直接删除文件夹
 */
ConfigHelper.prototype.deleteBookbox = function (param) {
  this.excuteUpdateBookData(function (param) {
    //  移动文件夹内容，移动book数据
    let delPath = _workspace + '/' + param.boxName + '/'
    let tempPath = _workspace + '/待整理/'
    if (param.type === 0) {
      copyFolder(delPath, tempPath, param.boxName)

      // 将删除的box内的书籍数据移动到代整理
      let defaultIndex = _booksConfig.bookboxs.findIndex(function (elem) {
        return elem.name === '待整理'
      })

      if (defaultIndex > -1) {
        let defaultBooks = _booksConfig.bookboxs[defaultIndex].books
        let tempBooks = _booksConfig.bookboxs[param.box_index].books
        tempBooks.forEach((item) => {
          let nIndex = 1
          let newBookName = item + '(' + nIndex + ')'
          while (isExistBook(defaultIndex, newBookName)) {
            ++nIndex
            newBookName = item + '(' + nIndex + ')'
          }

          defaultBooks.push(newBookName)
        })
      }
    }

    // 删除对应的文件夹
    deleteFolder(delPath)

    // 更新配置文件
    _booksConfig.bookboxs.splice(param.box_index, 1)
  }, param)
}

/**
 * 修改书架类型
 * @param {String} name
 * @param {int} index
 */
ConfigHelper.prototype.modifyBookbox = function (param) {
  this.excuteUpdateBookData(function (param) {
    // 修改文件夹名称
    let boxName = _booksConfig.bookboxs[param.box_index].name
    let oldPath = _workspace + '/' + boxName + '/'
    let newPath = _workspace + '/' + param.boxName + '/'
    _fs.renameSync(oldPath, newPath)

    // 更新配置文件
    _booksConfig.bookboxs[param.box_index].name = param.boxName
  }, param)
}

/**
 * 新增书籍
 * @param {int} boxindex
 * @param {String} name
 * @param {int} index
 */
ConfigHelper.prototype.addBook = function (param) {
  this.excuteUpdateBookData(function (param) {
    let boxName = _booksConfig.bookboxs[param.box_index].name
    // 新建对应的文件夹
    _fs.mkdirSync(_workspace + '/' + boxName + '/' + param.book_name + '/')

    // 更新配置文件
    _booksConfig.bookboxs[param.box_index].books.splice(param.book_index, 0, param.book_name)
  }, param)
}

/**
 * 删除书籍
 * @param {int} boxindex
 * @param {String} name
 * @param {int} index
 */
ConfigHelper.prototype.deleteBook = function (param) {
  this.excuteUpdateBookData(function (param) {
    // 删除对应的文件夹
    let boxName = _booksConfig.bookboxs[param.box_index].name
    let delPath = _workspace + '/' + boxName + '/' + param.book_name + '/'
    deleteFolder(delPath)

    // 更新配置文件
    _booksConfig.bookboxs[param.box_index].books.splice(param.book_index, 1)
  }, param)
}

/**
 * 修改书籍
 * @param {int} boxindex
 * @param {String} name
 * @param {int} index
 */
ConfigHelper.prototype.modifyBook = function (param) {
  this.excuteUpdateBookData(function (param) {
    // 修改文件夹名称
    let boxName = _booksConfig.bookboxs[param.box_index].name
    let oldName = _booksConfig.bookboxs[param.box_index].books[param.book_index]
    let oldPath = _workspace + '/' + boxName + '/' + oldName + '/'
    let newPath = _workspace + '/' + boxName + '/' + param.book_name + '/'
    _fs.renameSync(oldPath, newPath)

    // 更新配置文件
    _booksConfig.bookboxs[param.box_index].books.splice(param.book_index, 1, param.book_name)
  }, param)
}

function isExistBook (boxindex, bookname) {
  for (let i = 0; i < _booksConfig.bookboxs[boxindex].books.length; i++) {
    if (_booksConfig.bookboxs[boxindex].books[i] === bookname) {
      return true
    }
  }
  return false
}

function deleteFolder (delPath) {
  let files = []
  if (_fs.existsSync(delPath)) {
    files = _fs.readdirSync(delPath)
    files.forEach(function (file, index) {
      var curPath = delPath + '/' + file
      if (_fs.statSync(curPath).isDirectory()) {
        deleteFolder(curPath)
      } else {
        _fs.unlinkSync(curPath)
      }
    })
    _fs.rmdirSync(delPath)
  }
}

function copyFolder (src, dst, pre) {
  if (!_fs.existsSync(src)) {
    return
  }

  if (!_fs.existsSync(dst)) {
    _fs.mkdirSync(dst)
  }

  let files = []
  files = _fs.readdirSync(src)
  files.forEach(function (file, index) {
    var _src = src + '/' + file
    var _dst = dst + '/' + file

    if (_fs.statSync(_src).isDirectory()) {
      _dst = _dst + '(' + pre + ')'
      copyFolder(_src, _dst, pre)
    } else {
      let readable = _fs.createReadStream(_src)
      let writable = _fs.createWriteStream(_dst)
      readable.pipe(writable)
    }
  })
}

module.exports = new ConfigHelper()
