'use strict'
import _katexRenderer from './katex.render.js'
import _footnoteRenderer from './footnote.render.js'
import _tocRenderer from './toc.render.js'

function MarkdownRenderer () {}

let _text = ''

/**
 * 初始化
 */
MarkdownRenderer.prototype.init = function () {
  _footnoteRenderer.init()
  _tocRenderer.init()
  return this
}

/**
 * 设置待处理的字符串
 * @param {String} text
 */
MarkdownRenderer.prototype.set = function (text) {
  _text = text
  return this
}

/**
 * 获取处理后的字符串
 * @return {String} text
 */
MarkdownRenderer.prototype.get = function () {
  return _text
}

/**
 * 解析下划线标记
 */
MarkdownRenderer.prototype.underline = function () {
  let isUnderLine = /\+\+((?!\+).)*\+\+/.test(_text)
  if (isUnderLine) {
    _text = _text.replace(/\+\+((?!\+).)*\+\+/g, function (str, key) {
      str = str.replace(/\+/g, '')
      return `<u>${str}</u>`
    })
  }
  return this
}

/**
 * 解析自定义行内风格：示例(@s1:XXX)
 */
MarkdownRenderer.prototype.customStyle = function () {
  let isCustomStyle = /\(@((?!(\(|\))).)*:((?!(\(|\))).)*\)/.test(_text)
  if (isCustomStyle) {
    _text = _text.replace(/\(@((?!(\(|\))).)*:((?!(\(|\))).)*\)/g, function (str, key) {
      let index = str.indexOf(':')
      let flag = str.substring(2, index)
      let info = str.substring(index + 1, str.length - 1)
      return `<span class="${flag}">${info}</span>`
    })
  }
  return this
}

/**
 * 解析fontAwesome图标
 */
MarkdownRenderer.prototype.fontAwesome = function () {
  let isFontAwesome = /:(fa-([\w]+)(-(\w+)){0,}):/.test(_text)
  if (isFontAwesome) {
    _text = _text.replace(/:(fa-([\w]+)(-(\w+)){0,}):/g, function (str, key) {
      return `<i class="fa ${key} gy-emoji"></i>`
    })
  }
  return this
}

/**
 * 解析脚标：示例[^1] and [^1]: XXX
 */
MarkdownRenderer.prototype.footnote = function () {
  _text = _footnoteRenderer.render(_text)
  return this
}

/**
 * 获取描述内容转换后的html
 */
MarkdownRenderer.prototype.getFootnote = function () {
  return _footnoteRenderer.get()
}

/**
 * 解析段落数学公式
 */
MarkdownRenderer.prototype.katex = function () {
  _text = _katexRenderer.paragraphRender(_text)
  return this
}

/**
 * 解析代码段内数学公式
 */
MarkdownRenderer.prototype.codeKatex = function (code) {
  return _katexRenderer.codeRender(code)
}

/**
 * 解析标题：将所有标题缓存，用以生成目录
 */
MarkdownRenderer.prototype.head = function (text, level) {
  return _tocRenderer.headRender(text, level)
}

/**
 * 解析分目录subtoc：缓存所有分目录，最后同一替换
 */
MarkdownRenderer.prototype.subtoc = function () {
  _text = _tocRenderer.subTocRender(_text)
  return this
}

/**
 * 解析toc：用标题缓存，替换toc占位符
 */
MarkdownRenderer.prototype.replaceToc = function (text) {
  text = _tocRenderer.replaceSubToc(text)

  let isToc = /<p>\[TOC\]<\/p>/.test(text)
  if (isToc) {
    text = text.replace(/<p>\[TOC\]<\/p>/g, _tocRenderer.getToc())
  }
  return text
}

/**
 * 获取文章大纲
 */
MarkdownRenderer.prototype.getOutline = function () {
  return _tocRenderer.getToc()
}

/**
 * 解析自定义粘贴及拖拽的图片的相对路径
 */
MarkdownRenderer.prototype.imagePath = function (href, workspace) {
  let isCustomPath = /\*/g.test(href)
  if (isCustomPath) {
    href = href.replace(/\*/g, `${workspace}/.plateau/image`)
  }
  return href
}

export default new MarkdownRenderer()
