'use strict'

const app = require('electron').app
const path = require('path')

let appparam = {}
let _theapp = null

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

// Parse command line options.
const _argv = process.argv.slice(1)
var _userData = null
for (let i = 0; i < _argv.length; i++) {
  if (_argv[i].match(/^--user-data-dir=/)) {
    _userData = _argv[i].split('=')[1]
  } else if (_argv[i].match(/^--url=/)) {
    appparam.url = _argv[i].split('=')[1]
  } else if (_argv[i][0] === '-') {
    continue
  } else {

  }
}

// 仅运行一个实例
const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {})

if (isSecondInstance) {
  app.quit()
}

_theapp = require('./mainapp')
global.g_service = _theapp

app.commandLine.appendSwitch('process=per-site')
app.commandLine.appendSwitch('lang', 'zh-CN')
if (_userData != null) {
  app.setPath('userData', _userData)
  app.setPath('userCache', _userData)
  app.setPath('logs', path.join(_userData, 'logs'))
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', () => {
  if (_theapp != null) {
    _theapp.loadApp(appparam)
  }
})

app.on('activate', () => {
  if (_theapp != null) {
    _theapp.loadApp(appparam)
  }
})
