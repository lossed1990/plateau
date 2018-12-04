'use strict'
require('./ipcmain.js')

function MainApp () {}

MainApp.prototype.loadApp = function (param) {
  const mainWnd = require('./mainwnd.js')
  // mainWnd.createWnd('../pages/books.html');
  mainWnd.createWnd('https://www.baidu.com/')
}

module.exports = new MainApp()
