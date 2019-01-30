import marked from 'marked'
import katex from 'katex'
import hljs from 'highlight.js'
import 'highlight.js/styles/googlecode.css'

let _isInit = false
let _workSpace = ''
let _tocObj
let _footnoteFlagIndex = 0
let _footNotesObj

function katexRender (text) {
  // 解决部分字符解析问题 https://katex.org/docs/error.html
  text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  return katex.renderToString(text, {throwOnError: false})
}

function initMarkdown () {
  let markedRenderer = new marked.Renderer()
  _tocObj = {
    toc: [],
    index: 0,
    add: function (text, level) {
      var anchor = `#toc${level}${++this.index}`
      this.toc.push({ anchor: anchor, level: level, text: text })
      return anchor
    },
    toHtml: function () {
      let levelStack = []
      let result = ''
      const addStartUL = () => { result += '<ul>' }
      const addEndUL = () => { result += '</ul>\n' }
      const addLI = (anchor, text) => { result += '<li><a href="#' + anchor + '">' + text + '<a></li>\n' }

      this.toc.forEach(function (item) {
        let levelIndex = levelStack.indexOf(item.level)
        if (levelIndex === -1) {
          // 没有找到相应level的ul标签，则将li放入新增的ul中
          levelStack.unshift(item.level)
          addStartUL()
          addLI(item.anchor, item.text)
        } else if (levelIndex === 0) {
          // 找到了相应level的ul标签，并且在栈顶的位置则直接将li放在此ul下
          addLI(item.anchor, item.text)
        } else {
          // 找到了相应level的ul标签，但是不在栈顶位置，需要将之前的所有level出栈并且打上闭合标签，最后新增li
          while (levelIndex--) {
            levelStack.shift()
            addEndUL()
          }
          addLI(item.anchor, item.text)
        }
      })

      // 如果栈中还有level，全部出栈打上闭合标签
      while (levelStack.length) {
        levelStack.shift()
        addEndUL()
      }

      // 清理先前数据供下次使用
      this.toc = []
      this.index = 0
      return result
    }
  }

  _footNotesObj = {
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

  markedRenderer.heading = function (text, level, raw) {
    // 解析标题 H1~H6
    let anchor = _tocObj.add(text, level)
    return `<a id=${anchor} class="anchor-fix"></a><h${level}>${text}</h${level}>\n`
  }

  markedRenderer.image = function (href, title, text) {
    // 自定义解析粘贴及拖拽的图片的相对路径
    let isCustomPath = /\*/g.test(href)
    if (isCustomPath) {
      href = href.replace(/\*/g, `${_workSpace}/.plateau/image`)
      let out = '<img src="' + href + '" alt="' + text + '"'
      if (title) {
        out += ' title="' + title + '"'
      }
      out += marked.options.xhtml ? '/>' : '>'
      return out
    }

    // 默认解析
    return marked.Renderer.prototype.image.apply(this, arguments)
  }

  markedRenderer.paragraph = function (text) {
    let arrayLine = text.split('\n')
    console.log('isBr is true', arrayLine)
    let result = ''

    arrayLine.forEach(function (item) {
      // 解析TOC
      let isToc = /^\[TOC\]$/.test(item)
      if (isToc) {
        result += _tocObj.toHtml()
        return
      }

      // 解析脚标
      let isFootnoteFlag = /\[\^(((?!(\[|\])).)*)\]/.test(item)
      let isFootnoteContent = /^\[\^(.*)\]:(.*)$/.test(item)
      if (isFootnoteFlag && !isFootnoteContent) {
        item = item.replace(/\[\^(((?!(\[|\])).)*)\]/g, function (str, key) {
          return `<sup><a href="#fn:${key}" id="fnref:${key}" title="查看注脚" class="gy-footnote-flag">[${++_footnoteFlagIndex}]</a></sup>`
        })
      }

      if (isFootnoteContent) {
        let index = item.lastIndexOf(']:')
        let flag = item.substring(2, index)
        let info = item.substring(index + 2, item.length)
        _footNotesObj.add(flag, info)
        result += ''
        return
      }

      // 解析数学公式
      let isTeXInline = /\$\$(.*)\$\$/g.test(item)
      let isTeXLine = /^\$\$(.*)\$\$$/.test(item)

      if (!isTeXLine && isTeXInline) {
        item = item.replace(/(\$\$([^$]*)\$\$)+/g, function (str, key) {
          return katexRender(key.replace(/\$/g, ''))
        })
      } else if (isTeXLine) {
        let katexText = katexRender(text.replace(/\$/g, ''))
        result += `<p>${katexText}</p>\n`
        return
      }

      // 默认解析
      arguments[0] = item
      result += marked.Renderer.prototype.paragraph.apply(this, arguments)
    })

    return result
  }

  markedRenderer.code = function (code, lang, escaped) {
    // 通过katex库，支持数学公式
    if (lang === 'math' || lang === 'latex' || lang === 'katex') {
      let katexText = katexRender(code)
      return `<p>${katexText}</p>\n`
    }

    // if (lang === 'primary' || lang === 'success' || lang === 'info' || lang === 'warning' || lang === 'danger') {
    if (lang === 'tip1' || lang === 'tip2' || lang === 'tip3' || lang === 'tip4' || lang === 'tip5') {
      code = code.replace(/\n/g, `<br/>`)
      return `<div class="gy-markdown-tip ${lang}">${code}</div>\n`
    }

    // 通过mermaid，支持流程图等;【备注】暂不支持类图和git图，绘制坐标存在一些问题，未能解决/* || code.match(/^classDiagram/) || code.match(/^gitGraph/) */
    if (code.match(/^sequenceDiagram/) || code.match(/^graph/) || code.match(/^gantt/)) {
      // 另一种方式：直接渲染成svg标签，（需要import mermaid from 'mermaid'，并定义mermaidIndex变量）但是需要自己控制id，感觉不太合理。目前通过监听页面更新，然后渲染。
      // let info = ''
      // let callback = function (svgGraph) {
      //   info = svgGraph
      // }
      // mermaidIndex++
      // mermaid.render(`mermaid${mermaidIndex}`, code, callback)
      // return `<div id="mermaid${mermaidIndex}" style="width: 800px;height: 600px">${info}</div>`
      return '<div class="mermaid">' + code + '</div>'
    }

    // 总代码行数
    let rowCount = arguments[0].match(/\n/g).length + 1
    // 行号占位数
    let maxSpaceNumberCount = rowCount.toString().length
    let index = 1
    let strFlag = ' '.repeat(maxSpaceNumberCount - 1)
    arguments[0] = arguments[0].replace(/^/g, `${strFlag}1. `).replace(/\n/g, function () {
      index++
      // 行号前缀空格数
      let nSpaceCount = maxSpaceNumberCount - index.toString().length
      strFlag = ' '.repeat(nSpaceCount)
      return `\n${strFlag}${index}. `
    })
    return marked.Renderer.prototype.code.apply(this, arguments)
  }

  markedRenderer.listitem = function (text) {
    // 优化 - [ ] 和 -[x]的解析，去掉解析后li的样式
    if (/<input.*disabled="" type="checkbox">/.test(text)) {
      return '<li style="list-style: none;">' + text + '</li>\n'
    }

    return marked.Renderer.prototype.listitem.apply(this, arguments)
  }

  marked.setOptions({
    renderer: markedRenderer,
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    highlight: function (code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(lang, code, true).value
      } else {
        return hljs.highlightAuto(code).value
      }
    }
  })
}

export const compiledMarkdown = (content, workspace) => {
  _workSpace = workspace
  _footnoteFlagIndex = 0

  if (!_isInit) {
    initMarkdown()
    _isInit = true
  }

  let result = ''
  if (content && content.length > 0) {
    try {
      result = marked(content) + _footNotesObj.toHtml()
    } catch (e) {
      result = ''
      console.log('marked exception', e)
    }
  } else {
    console.log('marked null')
  }
  return result
}
