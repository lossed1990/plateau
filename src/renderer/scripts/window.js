'use strict'

export default function initWindow () {
  // 禁止拖入
  window.ondragover = (e) => {
    e.preventDefault()
    return false
  }
  window.ondrop = (e) => {
    e.preventDefault()
    return false
  }

  // 禁止拖动、选择、复制、粘贴、剪切
  document.ondragstart = (e) => {
    e.preventDefault()
    return false
  }
  document.onselectstart = (e) => {
    e.preventDefault()
    return false
  }
  document.onselect = (e) => {
    e.preventDefault()
    // document.selection.empty()
  }

  document.oncopy = (e) => {
    e.preventDefault()
    return false
  }
  document.onpaste = (e) => {
    e.preventDefault()
    return false
  }
  document.oncut = (e) => {
    e.preventDefault()
    return false
  }
}
