'use strict'

// 总目录,对应[TOC]标签
let _toc = []
let _index = 0
// 分目录，对应[toc]标签，保存解析后所有分目录信息{key:文本键值，用于后期替换成分目录html内容，parentIndex:父标题index，用于生成分目录，parentLevel:父标题level}
let _subToc = []

function TOCRenderer () {}

/**
 * 初始化
 */
TOCRenderer.prototype.init = function () {
  _toc = []
  _index = 0
  _subToc = []
}

/**
 * 解析标题
 */
TOCRenderer.prototype.headRender = function (text, level) {
  var anchor = `#toc${level}${++_index}`
  _toc.push({anchor: anchor, level: level, text: text})
  console.log('add', anchor)
  return `<a id=${anchor} class="anchor-fix"></a><h${level}>${text}</h${level}>\n`
}

/**
 * 解析分目录
 */
TOCRenderer.prototype.subTocRender = function (text) {
  let isSubToc = /^\[toc\]$/.test(text)
  if (isSubToc) {
    let key = `[subtoc-${_subToc.length}]`
    if (_toc.length < 1) {
      _subToc.push({ key: key, parentIndex: -1, parentLevel: 0 })
    } else {
      let parent = _toc[_toc.length - 1]
      _subToc.push({ key: key, parentIndex: _toc.length - 1, parentLevel: parent.level })
    }
    return key
  }
  return text
}

/**
 * 获取目录内容转换后的html
 */
TOCRenderer.prototype.getToc = function () {
  if (_toc.length === 0) {
    return ''
  }

  let result = '<ul>'
  _toc.forEach(function (item) {
    let space = '&nbsp;&nbsp;&nbsp;&nbsp;'.repeat(item.level - 1)
    result += `<li class="gy-toc-li" style="list-style: none;"><a href="#${item.anchor}">${space + item.text}<a></li>\n`
  })
  result += '</ul>\n'

  return result
}

TOCRenderer.prototype.replaceSubToc = function (text) {
  let self = this
  _subToc.forEach(function (item) {
    text = text.replace(item.key, self.getSubToc(item.parentIndex, item.parentLevel))
  })

  return text
}

TOCRenderer.prototype.getSubToc = function (parentIndex, parentLevel) {
  if (parentIndex === -1) {
    return this.getToc()
  }

  let subs = []
  for (let i = parentIndex + 1, len = _toc.length; i < len; ++i) {
    if (_toc[i].level === parentLevel + 1) {
      subs.push(_toc[i])
    }
  }

  if (subs.length === 0) {
    return ''
  }

  let result = '<ul>'
  subs.forEach(function (item) {
    result += `<li style="list-style: none;"><a href="#${item.anchor}">${item.text}<a></li>\n`
  })
  result += '</ul>\n'
  return result
}

export default new TOCRenderer()
