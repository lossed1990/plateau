const path = require('path')

/**
 * `electron-packager` options
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-packager.html
 * 
 * 这个文件内容很简单，用于electron-packager打包时读取，主要配置了最终生成exe文件的一些参数，包括：
 * arch|platform：目标架构和平台
 * asar：是否启用asar压缩打包
 * out|dir：指定生成目录
 * icon：图标
 * ignore：忽略哪些文件
 * overwrite：覆盖模式打包
 * 
 * 该文件中配置的参数其实都可以通过命令的形式实现：
 * electron-packager ./app <name> --platform=win32 --arch=x64 --overwrite --ignore=dev-settings
 */
module.exports = {
  arch: 'x64',
  asar: true,
  dir: path.join(__dirname, '../'),
  icon: path.join(__dirname, '../build/icons/icon'),
  ignore: /(^\/(src|test|\.[a-z]+|README|yarn|static|dist\/web))|\.gitkeep/,
  out: path.join(__dirname, '../build'),
  overwrite: true,
  platform: process.env.BUILD_TARGET || 'all'
}
