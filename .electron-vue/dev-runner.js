'use strict'

const chalk = require('chalk')
const electron = require('electron')
const path = require('path')
const { say } = require('cfonts')
const { spawn } = require('child_process')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackHotMiddleware = require('webpack-hot-middleware')

const mainConfig = require('./webpack.main.config')
const rendererConfig = require('./webpack.renderer.config')

let electronProcess = null
let manualRestart = false
let hotMiddleware

function logStats(proc, data) {
    let log = ''

    log += chalk.yellow.bold(`┏ ${proc} Process ${new Array((19 - proc.length) + 1).join('-')}`)
    log += '\n\n'

    if (typeof data === 'object') {
        data.toString({
            colors: true,
            chunks: false
        }).split(/\r?\n/).forEach(line => {
            log += '  ' + line + '\n'
        })
    } else {
        log += `  ${data}\n`
    }

    log += '\n' + chalk.yellow.bold(`┗ ${new Array(28 + 1).join('-')}`) + '\n'

    console.log(log)
}

function startRenderer() {
    return new Promise((resolve, reject) => {
        // 加载webpack配置文件，
        // webpack的配置文件来自于两个文件：dev-client.js和webpack.renderer.config中entry.renderer变量，
        // 结合output配置，这种用法的作用就是：同时把dev-client.js和main.js文件打包，输出到根目录下的/dist/electron/render.js文件中
        rendererConfig.entry.renderer = [path.join(__dirname, 'dev-client')].concat(rendererConfig.entry.renderer)
        rendererConfig.mode = 'development'

        // 创建webpack
        const compiler = webpack(rendererConfig)
        // 创建webpack-hot-middleware
        hotMiddleware = webpackHotMiddleware(compiler, {
            log: false,
            heartbeat: 2500
        })

        // 编译状态监控
        compiler.hooks.compilation.tap('compilation', compilation => {
            compilation.hooks.htmlWebpackPluginAfterEmit.tapAsync('html-webpack-plugin-after-emit', (data, cb) => {
                // 钩子函数，检测webpack的编译状态，把其中的html-webpack-plugin-after-emit状态，发布到webpackHotMiddleware中,然后通过dev-client.js模块通知页面
                hotMiddleware.publish({ action: 'reload' })
                cb()
            })
        })

        compiler.hooks.done.tap('done', stats => {
            // 在终端屏幕上输出编译过程
            logStats('Renderer', stats)
        })

        // 创建webpack-dev-server
        const server = new WebpackDevServer(
            compiler, {
                contentBase: path.join(__dirname, '../'),
                quiet: true,
                before(app, ctx) {
                    app.use(hotMiddleware)
                    ctx.middleware.waitUntilValid(() => {
                        resolve()
                    })
                }
            }
        )

        server.listen(9080)
    })
}

function startMain() {
    return new Promise((resolve, reject) => {
        // 加载webpack配置文件，
        // webpack的配置文件来自于两个文件：index.dev.js和webpack.main.config 
        mainConfig.entry.main = [path.join(__dirname, '../src/main/index.dev.js')].concat(mainConfig.entry.main)
        mainConfig.mode = 'development'
        // 创建主进程的webpack
        const compiler = webpack(mainConfig)

        compiler.hooks.watchRun.tapAsync('watch-run', (compilation, done) => {
            logStats('Main', chalk.white.bold('compiling...'))
            // 向webpack-hot-middleware发布"compiling"的消息，用于页面显示
            // hotMiddleware.publish({ action: 'compiling' })
            done()
        })

        compiler.watch({}, (err, stats) => {
            if (err) {
                console.log(err)
                return
            }

            logStats('Main', stats)

            if (electronProcess && electronProcess.kill) {
                // 主进程文件发生改变，重启Electron
                // manualRestart = true
                // process.kill(electronProcess.pid)
                // electronProcess = null
                // startElectron()

                // setTimeout(() => {
                //    manualRestart = false
                // }, 5000)
            }

            resolve()
        })
    })
}

function startElectron() {
    var args = [
        //'--inspect-brk=5858',
        '--inspect=5858',
        path.join(__dirname, '../dist/electron/main.js')
    ]

    // detect yarn or npm and process commandline args accordingly
    if (process.env.npm_execpath.endsWith('yarn.js')) {
        args = args.concat(process.argv.slice(3))
    } else if (process.env.npm_execpath.endsWith('npm-cli.js')) {
        args = args.concat(process.argv.slice(2))
    }

    // 通过node的spawn方法运行electron，并传递了两个参数：打开5858调试端口和electron的运行目录（即当前目录）
    electronProcess = spawn(electron, args)

    electronProcess.stdout.on('data', data => {
        electronLog(data, 'blue')
    })
    electronProcess.stderr.on('data', data => {
        electronLog(data, 'red')
    })

    electronProcess.on('close', () => {
        if (!manualRestart) process.exit()
    })
}

function electronLog(data, color) {
    let log = ''
    data = data.toString().split(/\r?\n/)
    data.forEach(line => {
        log += `  ${line}\n`
    })
    if (/[0-9A-z]+/.test(log)) {
        console.log(
            chalk[color].bold('┏ Electron -------------------') +
            '\n\n' +
            log +
            chalk[color].bold('┗ ----------------------------') +
            '\n'
        )
    }
}

// 在终端输出一个“electron-vue”logo
function greeting() {
    const cols = process.stdout.columns
    let text = ''

    if (cols > 104) text = 'electron-vue'
    else if (cols > 76) text = 'electron-|vue'
    else text = false

    if (text) {
        say(text, {
            colors: ['yellow'],
            font: 'simple3d',
            space: false
        })
    } else console.log(chalk.yellow.bold('\n  electron-vue'))
    console.log(chalk.blue('  getting ready...') + '\n')
}

function init() {
    // 在终端输出一个“electron-vue”logo
    greeting()

    // 启动渲染进程、主进程、Electron
    Promise.all([startRenderer(), startMain()])
        .then(() => {
            startElectron()
        })
        .catch(err => {
            console.error(err)
        })
}

init()