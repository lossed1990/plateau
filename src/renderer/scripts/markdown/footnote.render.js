'use strict'

let _count = 0
let _content = {
  footnote: [],
  index: 0,
  add: function (flag, text) {
    var anchor = `<span id="fn:${flag}">[${++this.index}] </span>${text}<a href="#fnref:${flag}" title="回到文稿" class="gy-footnote fa fa-hand-o-up"></a><br/>`
    this.footnote.push(anchor)
  },
  toHtml: function () {
    if (this.footnote.length === 0) {
      return ''
    }

    let result = '<div class="gy-footnotes-div"><hr><small>'
    this.footnote.forEach(function (item) {
      result += item
    })
    result += '</small></div>'

    // 清理先前数据供下次使用
    this.footnote = []
    this.index = 0
    return result
  }
}

function FootnoteRenderer () {}

/**
 * 初始化脚标的数量
 */
FootnoteRenderer.prototype.init = function () {
  _count = 0
}

/**
 * 解析脚标：示例[^1] and [^1]: XXX
 * 文内标记直接返回；脚标描述内容缓存，供后期一并获取；
 */
FootnoteRenderer.prototype.render = function (text) {
  let isFootnoteFlag = /\[\^(((?!(\[|\])).)*)\]/.test(text)
  let isFootnoteContent = /\[\^(.*)\]:(.*)$/.test(text)
  if (isFootnoteFlag && !isFootnoteContent) {
    text = text.replace(/\[\^(((?!(\[|\])).)*)\]/g, function (str, key) {
      return `<sup><a href="#fn:${key}" id="fnref:${key}" title="查看注脚" class="gy-footnote-flag">[${++_count}]</a></sup>`
    })
  }

  if (isFootnoteContent) {
    let index = text.lastIndexOf(']:')
    let flag = text.substring(2, index)
    let info = text.substring(index + 2, text.length)
    _content.add(flag, info)
    return ''
  }
  return text
}

/**
 * 获取脚标描述内容转换后的html
 */
FootnoteRenderer.prototype.get = function () {
  return _content.toHtml()
}

export default new FootnoteRenderer()
