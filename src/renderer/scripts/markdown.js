import marked from 'marked'

let isInit = false
let tocObj

function initMarkdown () {
  let markedRenderer = new marked.Renderer()
  tocObj = {
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

  markedRenderer.heading = function (text, level, raw) {
    console.log('markedRenderer heading', `text:${text};level:${level};raw:${raw}`)
    let anchor = tocObj.add(text, level)
    return `<a id=${anchor} class="anchor-fix"></a><h${level}>${text}</h${level}>\n`
  }

  let oldParagraph = markedRenderer.paragraph
  console.log('oldParagraph', oldParagraph)
  markedRenderer.paragraph = function (text) {
    let isToc = /^\[TOC\]$/.test(text)
    if (isToc) {
      return tocObj.toHtml()
    }
    // console.log('paragraph', isToC)
    // console.log(tocObj.toHtml())
    return oldParagraph(text)
    // let isTeXInline = /\$\$(.*)\$\$/g.test(text)
    // let isTeXLine = /^\$\$(.*)\$\$$/.test(text)
    // let isTeXAddClass = (isTeXLine) ? " class=\"editormd-tex\"" : ""
    // let isToC = /^\[TOC\]$/.test(text)

    // if (!isTeXLine && isTeXInline)
    // {
    //   text = text.replace(/(\$\$([^\$]*)\$\$)+/g, function($1, $2) {
    //     return "<span class=\"editormd-tex\">" + $2.replace(/\$/g, "") + "</span>"
    //   })
    // }
    // else
    // {
    //   text = (isTeXLine) ? text.replace(/\$/g, "") : text
    // }

    // var tocHTML = "<div class=\"markdown-toc editormd-markdown-toc\">" + text + "</div>"
    // console('tocHTML', tocHTML)
    // return (isToC) ? tocHTML  : ( "<p" + isTeXAddClass + ">" + this.atLink(this.emoji(text)) + "</p>\n" );
  }

  marked.setOptions({
    renderer: markedRenderer,
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
  })
}

export const compiledMarkdown = (content) => {
  if (!isInit) {
    initMarkdown()
    isInit = true
  }

  // let strContent = marked(content)
  // return tocObj.toHtml() + strContent
  return marked(content)
}

// import MarkdownIt from 'markdown-it'
// import MarkdownItCheckbox from 'markdown-it-checkbox'
// import MarkdownItFootnote from 'markdown-it-footnote'

// import Prism from 'prismjs'
// import 'prismjs/plugins/remove-initial-line-feed/prism-remove-initial-line-feed.min.js'

// export const initMarkdown = () => {
//   let markdown = new MarkdownIt({
//     html: true,
//     xhtmlOut: false,
//     breaks: true,
//     langPrefix: 'language-',
//     linkify: true,
//     typographer: true,
//     highlight: function (str, lang) {
//       const language = !lang || lang === 'html' ? 'markup' : lang
//       try {
//         if (!Prism.languages[language]) {
//           require(`prismjs/components/prism-${language}.min.js`)
//         }
//         if (Prism.languages[language]) {
//           return Prism.highlight(str, Prism.languages[language])
//         }
//       } catch (e) {
//         console.error(e)
//         return ''
//       }

//       return ''
//     }
//   })

//   markdown
//     .use(MarkdownItCheckbox, {
//       idPrefix: 'checkbox_'
//     })
//     .use(MarkdownItFootnote)

//   return markdown
// }
