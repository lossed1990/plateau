import marked from 'marked'
import hljs from 'highlight.js'
import _markdownRenderer from './markdown/markdown.render.js'
import 'highlight.js/styles/googlecode.css'

let _isInit = false
let _workSpace = ''

function initMarkdown () {
  let markedRenderer = new marked.Renderer()

  markedRenderer.heading = function (text, level, raw) {
    return _markdownRenderer.head(text, level)
  }

  markedRenderer.image = function (href, title, text) {
    arguments[0] = _markdownRenderer.imagePath(href, _workSpace)
    return marked.Renderer.prototype.image.apply(this, arguments)
  }

  markedRenderer.paragraph = function (text) {
    let arrayLines = text.split('\n')
    let result = ''

    arrayLines.forEach(function (item) {
      arguments[0] = _markdownRenderer.set(item)
        .underline()
        .customStyle()
        .footnote()
        .katex()
        .subtoc()
        .get()

      result += marked.Renderer.prototype.paragraph.apply(this, arguments)
    })
    return result
  }

  markedRenderer.code = function (code, lang, escaped) {
    // 通过katex库，支持数学公式
    if (lang === 'math' || lang === 'latex' || lang === 'katex') {
      return _markdownRenderer.codeKatex(code)
    }

    // 解析自定义注释提示行
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
    text = _markdownRenderer.set(text)
      .underline()
      .customStyle()
      .footnote()
      .katex()
      .get()

    // 解析todo列表：优化 - [ ] 和 -[x]的解析，去掉解析后li的样式
    let isTodoList = /<input.*disabled="" type="checkbox">/.test(text)
    if (isTodoList) {
      return '<li style="list-style: none;">' + text + '</li>\n'
    }

    arguments[0] = text
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
  _markdownRenderer.init()

  if (!_isInit) {
    initMarkdown()
    _isInit = true
  }

  let result = ''
  if (content && content.length > 0) {
    try {
      result = marked(content) + _markdownRenderer.getFootnote()
      result = _markdownRenderer.replaceToc(result)
    } catch (e) {
      result = ''
      console.log('marked exception', e)
    }
  } else {
    console.log('marked null')
  }
  return result
}
