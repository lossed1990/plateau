// 'use strict'

// import { app, BrowserWindow } from 'electron'

// /**
//  * Set `__static` path to static files in production
//  * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
//  */
// if (process.env.NODE_ENV !== 'development') {
//   global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
// }

// let mainWindow
// const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`

// function createWindow () {
//   /**
//     * Initial window options
//   */
//   mainWindow = new BrowserWindow({
//     // height: 563,
//     // useContentSize: true,
//     // width: 1000
//     width: 1800,
//     height: 800,
//     minWidth: 400,
//     minHeight: 400,
//     useContentSize: true,
//     frame: false,
//     thickFrame: false,
//     autoHideMenuBar: true,
//     show: true,
//     title: ''
//   })

//   mainWindow.loadURL(winURL)

//   mainWindow.on('closed', () => {
//     mainWindow = null
//   })
// }

// app.on('ready', createWindow)

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

// app.on('activate', () => {
//   if (mainWindow === null) {
//     createWindow()
//   }
// })

'use strict'

const _app = require('electron').app
const _path = require('path')

let _appparam = {}
let _theapp = null

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = _path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

// Parse command line options.
const _argv = process.argv.slice(1)
var _userData = null
for (let i = 0; i < _argv.length; i++) {
  if (_argv[i].match(/^--user-data-dir=/)) {
    _userData = _argv[i].split('=')[1]
  } else if (_argv[i].match(/^--url=/)) {
    _appparam.url = _argv[i].split('=')[1]
  } else if (_argv[i][0] === '-') {
    continue
  } else {

  }
}

// 仅运行一个实例
const isSecondInstance = _app.makeSingleInstance((commandLine, workingDirectory) => {})

if (isSecondInstance) {
  _app.quit()
}

_theapp = require('./mainapp')
global.g_service = _theapp

_app.commandLine.appendSwitch('process=per-site')
_app.commandLine.appendSwitch('lang', 'zh-CN')
if (_userData != null) {
  _app.setPath('userData', _userData)
  _app.setPath('userCache', _userData)
  _app.setPath('logs', _path.join(_userData, 'logs'))
}

_app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    _app.quit()
  }
})

_app.on('ready', () => {
  if (_theapp != null) {
    _theapp.loadApp(_appparam)
  }
})

_app.on('activate', () => {
  if (_theapp != null) {
    _theapp.loadApp(_appparam)
  }
})
