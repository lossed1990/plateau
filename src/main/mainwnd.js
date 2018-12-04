'use strict'
const { app, BrowserWindow, Tray, Menu } = require('electron')
const path = require('path')

let mainWindow = null
let appTray = null
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`

function createWnd (homeurl) {
  const options = {
    width: 1800,
    height: 800,
    minWidth: 400,
    minHeight: 400,
    useContentSize: true,
    frame: false,
    thickFrame: false,
    autoHideMenuBar: true,
    show: false,
    title: '',
    webPreferences: {
      nodeIntegrationInWorker: true
      // preload: path.join(__dirname, '../pages/scripts/home.js')
    }
  }
  options.icon = path.join(__dirname, '../assets/app-icon/logo.ico')
  mainWindow = new BrowserWindow(options)

  if (process.platform !== 'darwin') {
    // 创建托盘图标
    appTray = new Tray(options.icon)
    const contextMenu = Menu.buildFromTemplate([
      { label: '显示', click () { mainWindow.show() } },
      { label: '退出', click () { app.quit() } }
    ])

    // Call this again for Linux because we modified the context menu
    appTray.setContextMenu(contextMenu)
    appTray.setToolTip(mainWindow.getTitle())
    mainWindow.on('page-title-updated', (event, title) => {
      appTray.setToolTip(title)
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
    appTray = null
  })

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.openDevTools()
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.on('will-attach-webview', (event, webPreferences, params) => {
    if (homeurl) {
      params.src = 'file://' + path.join(__dirname, homeurl)
    } else {
      params.src = 'file://' + path.join(__dirname, '../pages/books.html')
    }
    // params.preload = 'file://' + path.join(__dirname, '../pages/scripts/home.js');
    webPreferences.preloadURL = params.preload
  })

  // var html = 'file://' + path.join(__dirname, '../pages/home.html');
  // mainWindow.loadURL(html);
  mainWindow.loadURL(winURL)
};

exports.createWnd = (homeurl) => {
  createWnd(homeurl)
}
