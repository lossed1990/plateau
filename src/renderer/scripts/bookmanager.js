'use strict'
var _config = require('../../config/config.json')
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
    var configData = _fs.readFileSync(configPath, 'utf-8')
    _booksConfig = JSON.parse(configData)
    let workspaceInfo = { workspace: path, bookboxs: [] }
    for (let i = 0, len = _booksConfig.bookboxs.length; i < len; i++) {
      let itemBookbox = {
        name: _booksConfig.bookboxs[i].name,
        rename: false,
        books: []
      }
      for (let j = 0, len1 = _booksConfig.bookboxs[i].books.length; j < len1; j++) {
        let itemBook = {
          icon: './static/images/icon.png',
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

  let configPath = _path.join(__dirname, '../../config/config.json')
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
    _booksConfig.bookboxs.splice(param.boxIndex, 0, newValue)
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
      // 将删除的box内的书籍数据移动到代整理
      let defaultIndex = _booksConfig.bookboxs.length - 1
      copyFolder(delPath, tempPath, defaultIndex)

      if (defaultIndex > -1) {
        let defaultBooks = _booksConfig.bookboxs[defaultIndex].books
        let tempBooks = _booksConfig.bookboxs[param.boxIndex].books
        tempBooks.forEach((item) => {
          let nIndex = 1
          let newBookName = item + '(' + nIndex + ')'
          while (_booksConfig.bookboxs[defaultIndex].books.findIndex((item) => item === newBookName) !== -1) {
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
    _booksConfig.bookboxs.splice(param.boxIndex, 1)
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
    let boxName = _booksConfig.bookboxs[param.boxIndex].name
    let oldPath = _workspace + '/' + boxName + '/'
    let newPath = _workspace + '/' + param.boxName + '/'
    _fs.renameSync(oldPath, newPath)

    // 更新配置文件
    _booksConfig.bookboxs[param.boxIndex].name = param.boxName
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
    let boxName = _booksConfig.bookboxs[param.boxIndex].name
    // 新建对应的文件夹
    _fs.mkdirSync(_workspace + '/' + boxName + '/' + param.bookName + '/')

    // 更新配置文件
    _booksConfig.bookboxs[param.boxIndex].books.splice(param.bookIndex, 0, param.bookName)
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
    let boxName = _booksConfig.bookboxs[param.boxIndex].name
    let delPath = _workspace + '/' + boxName + '/' + param.bookName + '/'
    deleteFolder(delPath)

    // 更新配置文件
    _booksConfig.bookboxs[param.boxIndex].books.splice(param.bookIndex, 1)
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
    let boxName = _booksConfig.bookboxs[param.boxIndex].name
    let oldName = _booksConfig.bookboxs[param.boxIndex].books[param.bookIndex]
    let oldPath = _workspace + '/' + boxName + '/' + oldName + '/'
    let newPath = _workspace + '/' + boxName + '/' + param.bookName + '/'
    _fs.renameSync(oldPath, newPath)

    // 更新配置文件
    _booksConfig.bookboxs[param.boxIndex].books.splice(param.bookIndex, 1, param.bookName)
  }, param)
}

/**
 * 遍历文件夹中的md文件
 * @param {String} path
 */
ConfigHelper.prototype.selectMdFiles = function (path) {
  try {
    if (_workspace === '') {
      throw new Error('_workspace is no initialization')
    }

    let mdFiles = []
    let folderPath = _workspace + '/' + path
    let files = _fs.readdirSync(folderPath)
    files.forEach(function (ele) {
      let info = _fs.statSync(folderPath + '/' + ele)
      if (!info.isDirectory()) {
        console.log('file: ' + ele)
        let fileItem = {name: ele}
        mdFiles.push(fileItem)
      }
    })
    return mdFiles
  } catch (e) {
    console.error('selectMdFiles failed', e)
  }
}

ConfigHelper.prototype.createMdFile = function (path, name) {
  try {
    if (_workspace === '') {
      throw new Error('_workspace is no initialization')
    }

    let filePath = _workspace + '/' + path + '/' + name
    _fs.writeFileSync(filePath, '')
    return true
  } catch (e) {
    console.error('createMdFile failed', e)
    return false
  }
}

ConfigHelper.prototype.modifyMdFileName = function (path, oldName, newName) {
  try {
    if (_workspace === '') {
      throw new Error('_workspace is no initialization')
    }

    let oldFilePath = _workspace + '/' + path + '/' + oldName
    let newFilePath = _workspace + '/' + path + '/' + newName
    _fs.renameSync(oldFilePath, newFilePath)
    return true
  } catch (e) {
    console.error('modifyMdFileName failed', e)
    return false
  }
}

// function isExistBook (boxindex, bookname) {
//   for (let i = 0; i < _booksConfig.bookboxs[boxindex].books.length; i++) {
//     if (_booksConfig.bookboxs[boxindex].books[i] === bookname) {
//       return true
//     }
//   }
//   return false
// }

function deleteFolder (delPath) {
  if (_fs.existsSync(delPath)) {
    let files = _fs.readdirSync(delPath)
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

function copyFolder (src, dst, index) {
  if (!_fs.existsSync(src)) {
    return
  }

  if (!_fs.existsSync(dst)) {
    _fs.mkdirSync(dst)
  }

  let files = _fs.readdirSync(src)
  files.forEach(function (file) {
    let tempSrc = src + '/' + file
    let tempDst = dst + '/' + file

    if (_fs.statSync(tempSrc).isDirectory()) {
      let nIndex = 1
      let tempFileName = `${file}(${nIndex})`
      while (_booksConfig.bookboxs[index].books.findIndex((item) => item === tempFileName) !== -1) {
        ++nIndex
        tempFileName = `${file}(${nIndex})`
      }

      tempDst = dst + '/' + tempFileName
      if (_fs.existsSync(tempDst)) {
        throw new Error('tempDst is exist, config file may be modify by user')
      }
      copyFolder(tempSrc, tempDst, index)
    } else {
      let readable = _fs.createReadStream(tempSrc)
      let writable = _fs.createWriteStream(tempDst)
      readable.pipe(writable)
    }
  })
}

module.exports = new ConfigHelper()
