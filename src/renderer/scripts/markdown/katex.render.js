'use strict'

import katex from 'katex'

function KatexRenderer () {}

/**
 * 解析段落内数学公式
 */
KatexRenderer.prototype.paragraphRender = function (text) {
  let isTeXInline = /\$\$(.*)\$\$/g.test(text)
  let isTeXLine = /^\$\$(.*)\$\$$/.test(text)

  if (!isTeXLine && isTeXInline) {
    text = text.replace(/(\$\$([^$]*)\$\$)+/g, function (str, key) {
      return katexToString(key.replace(/\$/g, ''))
    })
  } else if (isTeXLine) {
    let katexText = katexToString(text.replace(/\$/g, ''))
    text = `<p>${katexText}</p>\n`
  }
  return text
}

/**
 * 解析code标签内数学公式
 */
KatexRenderer.prototype.codeRender = function (code) {
  return `<p>${katexToString(code)}</p>\n`
}

function katexToString (text) {
  // 解决部分字符解析问题 https://katex.org/docs/error.html
  text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  return katex.renderToString(text, {throwOnError: false})
}

export default new KatexRenderer()
