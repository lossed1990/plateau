'use strict'
require('./ipcmain.js')

function MainApp () {}

MainApp.prototype.loadApp = function (param) {
  const mainWnd = require('./mainwnd.js')
  mainWnd.createWnd()
  console.log('MainApp.prototype.loadApp')
}

module.exports = new MainApp()
