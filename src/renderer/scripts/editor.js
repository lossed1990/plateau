import 'vue-codemirror/node_modules/codemirror/mode/gfm/gfm.js'
import 'vue-codemirror/node_modules/codemirror/mode/markdown/markdown.js'
import 'vue-codemirror/node_modules/codemirror/mode/xml/xml.js'
import 'vue-codemirror/node_modules/codemirror/addon/edit/closetag.js'
import 'vue-codemirror/node_modules/codemirror/addon/edit/continuelist.js'
import 'vue-codemirror/node_modules/codemirror/addon/edit/closebrackets.js'
import 'vue-codemirror/node_modules/codemirror/addon/lint/lint.js'
import 'vue-codemirror/node_modules/codemirror/addon/mode/overlay.js'
import 'vue-codemirror/node_modules/codemirror/addon/fold/foldcode.js'
import 'vue-codemirror/node_modules/codemirror/addon/fold/foldgutter.js'
import 'vue-codemirror/node_modules/codemirror/addon/fold/brace-fold.js'
import 'vue-codemirror/node_modules/codemirror/addon/fold/xml-fold.js'
import 'vue-codemirror/node_modules/codemirror/addon/fold/markdown-fold.js'
import 'vue-codemirror/node_modules/codemirror/addon/fold/comment-fold.js'
import 'vue-codemirror/node_modules/codemirror/addon/selection/active-line.js'

// const controlKey = process.platform === 'win32' ? 'Ctrl' : 'Cmd'

export default {
  mode: {
    name: 'markdown',
    highlightFormatting: true
  },
  theme: 'mdn-like', // 使用neo模版 备选mdn-like  markdown
  cursorHeight: 0.8,
  autofocus: true,
  autoCloseTags: true,
  showCursorWhenSelecting: true,
  inputStyle: 'textarea',
  lineNumbers: true, // 显示行数
  lineWrapping: true, // 自动换行
  // foldGutter: true, // 展开收起
  tabSize: 2,
  indentUnit: 4, // 缩进单位为4
  electricChars: true,
  // styleActiveLine: true, // 当前行背景高亮
  matchBrackets: true, // 括号匹配
  dragDrop: false,
  autoCloseBrackets: true,
  autoRefresh: true,
  extraKeys: {
    // Enter: 'newlineAndIndentContinueMarkdownList',
    // // **bold**
    // [`${controlKey}-B`]: function (cm) {
    //   let s = cm.getSelection()
    //   let t = s.slice(0, 2) === '**' && s.slice(-2) === '**'
    //   cm.replaceSelection(t ? s.slice(2, -2) : '**' + s + '**', 'around')
    // },
    // // _italic_
    // [`${controlKey}-I`]: function (cm) {
    //   let s = cm.getSelection()
    //   let t = s.slice(0, 1) === '_' && s.slice(-1) === '_'
    //   cm.replaceSelection(t ? s.slice(1, -1) : '_' + s + '_', 'around')
    // },
    // // `code`
    // 'Shift-@': function (cm) {
    //   let s = cm.getSelection()
    //   let t = s.slice(0, 1) === '`' && s.slice(-1) === '`'
    //   cm.replaceSelection(t ? s.slice(1, -1) : '`' + s + '`', 'around')
    // }
    // [`${controlKey}-C`]: function (cm) {
    //   let s = cm.getSelection()
    //   function copyEvent (event) {
    //     event.clipboardData.setData('Text', s)
    //     event.preventDefault()
    //     document.removeEventListener('copy', copyEvent)
    //   }
    //   document.addEventListener('copy', copyEvent)
    //   document.execCommand('copy', false, null)
    // }
  },
  gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
  styleSelectedText: true
  // highlightSelectionMatches: {
  // showToken: /\w/, annotateScrollbar: true
  // },
}
