const state = {
  leftToolBarWidth: 66,
  fileListBarWidth: 200,
  showStatusBar: false,
  showFileListBar: true,
  theme: 'default'
}

const mutations = {
  SET_LEFTTOOLBAR_WIDTH (state, width) {
    state.leftToolBarWidth = width
  },
  SET_FILELISTBAR_WIDTH (state, width) {
    state.fileListBarWidth = width
  },
  SET_SHOW_STATUS_BAR (state, bShow) {
    state.showStatusBar = bShow
  },
  SET_SHOW_FILELIST_BAR (state, bShow) {
    state.showFileListBar = bShow
  },
  SET_THEME (state, theme) {
    state.theme = theme
  }
}

const actions = {
  setLeftToolBarWidth ({ commit }, width) {
    commit('SET_LEFTTOOLBAR_WIDTH', width)
  },
  setFileListBarWidth ({ commit }, width) {
    commit('SET_FILELISTBAR_WIDTH', width)
  },
  showStatusBar ({ commit }, bShow) {
    commit('SET_SHOW_STATUS_BAR', bShow)
  },
  showFileListBar ({ commit }, bShow) {
    commit('SET_SHOW_FILELIST_BAR', bShow)
  },
  setTheme ({ commit }, theme) {
    commit('SET_THEME', theme)
  }
}

export default {
  state,
  mutations,
  actions
}
