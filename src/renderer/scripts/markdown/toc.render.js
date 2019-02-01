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
  // 网上一种方式，后面优化处理
  // let levelStack = []
  // let result = ''

  // const addStartUL = () => { result += '<ul>' }
  // const addEndUL = () => { result += '</ul>\n' }
  // const addLI = (anchor, text) => { result += '<li style="list-style: none;"><a href="#' + anchor + '">' + text + '<a></li>\n' }

  // _toc.forEach(function (item) {
  //   let levelIndex = levelStack.indexOf(item.level)
  //   if (levelIndex === -1) {
  //     // 没有找到相应level的ul标签，则将li放入新增的ul中
  //     levelStack.unshift(item.level)
  //     addStartUL()
  //     addLI(item.anchor, item.text)
  //   } else if (levelIndex === 0) {
  //     // 找到了相应level的ul标签，并且在栈顶的位置则直接将li放在此ul下
  //     addLI(item.anchor, item.text)
  //   } else {
  //     // 找到了相应level的ul标签，但是不在栈顶位置，需要将之前的所有level出栈并且打上闭合标签，最后新增li
  //     while (levelIndex--) {
  //       levelStack.shift()
  //       addEndUL()
  //     }
  //     addLI(item.anchor, item.text)
  //   }
  // })

  // // 如果栈中还有level，全部出栈打上闭合标签
  // while (levelStack.length) {
  //   levelStack.shift()
  //   addEndUL()
  // }

  // // 清理先前数据供下次使用
  // _toc = []
  // _index = 0
  // return result

  if (_toc.length === 0) {
    return ''
  }

  let result = '<ul>'
  _toc.forEach(function (item) {
    let space = '&nbsp;&nbsp;&nbsp;&nbsp;'.repeat(item.level - 1)
    result += `<li style="list-style: none;"><span>${space}</span><a href="#${item.anchor}">${item.text}<a></li>\n`
  })
  result += '</ul>\n'

  // 清理先前数据供下次使用
  _toc = []
  _index = 0
  return result
}

TOCRenderer.prototype.replaceSubToc = function (text) {
  let self = this
  _subToc.forEach(function (item) {
    text = text.replace(item.key, self.getSubToc(item.parentIndex, item.parentLevel))
  })

  _subToc = []
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
