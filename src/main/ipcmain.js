'use strict'
const _ipcMain = require('electron').ipcMain
const _dialog = require('electron').dialog
// const _fs = require('fs')
const _configHelper = require('./config')

// 公共ipc请求处理函数
_ipcMain.on('COMMON_IPC_REQUEST', function (event, method, param, callback) {
  switch (method) {
    case 'getWorkSpace': // 从配置文件读取当前的工作目录
      onGetWorkSpace(event, method, param, callback)
      break
    case 'selectWorkSpace': // 重新选择工作目录
      onSelectWorkSpace(event, method, param, callback)
      break
    case 'updateBookData': // 更新书籍数据
      onUpdateBookData(event, method, param, callback)
      break
    default:
      let errCode = 1
      let response = '{err_info:function is undefined}'
      event.sender.send('COMMON_IPC_RESPONE', method, errCode, callback, response)
      break
  }
})

function onGetWorkSpace (event, method, param, callback) {
  let response = _configHelper.getWorkspace()
  event.sender.send('COMMON_IPC_RESPONE', method, 0, callback, response)
}

function onSelectWorkSpace (event, method, param, callback) {
  _dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory']
  }, function (files) {
    try {
      if (files && files.length > 0) {
        let response = _configHelper.changeWorkspace(files[0])
        event.sender.send('COMMON_IPC_RESPONE', method, 0, callback, response)
      }
    } catch (e) {
      if (e.errno === -4048) {
        event.sender.send('COMMON_IPC_RESPONE', method, 1, callback, { 'err_info': '没有权限操作此文件夹，请以管理员权限运行程序或更换目录！' })
      } else {
        event.sender.send('COMMON_IPC_RESPONE', method, 1, callback, { 'err_info': '工作目录打开失败，请尝试其他目录！' })
      }
    }
  })
}

function onUpdateBookData (event, method, param, callback) {
  if (_configHelper.updateBookData(param)) {
    event.sender.send('COMMON_IPC_RESPONE', method, 0, callback, param)
    return
  }

  event.sender.send('COMMON_IPC_RESPONE', method, 1, callback, { 'err_info': '操作失败，请重试！' })
}
