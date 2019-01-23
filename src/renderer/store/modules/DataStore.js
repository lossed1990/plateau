const state = {
  workspacePath: '',
  currentSelectBook: {
    name: '',
    path: '',
    file: ''
  }
}

const mutations = {
  RESET_WORKSPACE_PATH (state) {
    state.workspacePath = ''
  },
  SET_WORKSPACE_PATH (state, path) {
    state.workspacePath = path
  },
  SET_CURRENTSELECTBOOK_NAME (state, name) {
    // 当前选择书籍名称
    state.currentSelectBook.name = name
  },
  SET_CURRENTSELECTBOOK_PATH (state, path) {
    // 当前选择书籍路径
    state.currentSelectBook.path = path
  },
  SET_CURRENTSELECTBOOK_FILE (state, file) {
    // 当前编辑的文件名称
    state.currentSelectBook.file = file
  }
}

const actions = {
  updateWorkspacePath ({ commit }, path) {
    commit('SET_WORKSPACE_PATH', path)
  },
  setCurrentSelectBookName ({ commit }, name) {
    commit('SET_CURRENTSELECTBOOK_NAME', name)
  },
  setCurrentSelectBookPath ({ commit }, path) {
    commit('SET_CURRENTSELECTBOOK_PATH', path)
  },
  setCurrentSelectBookFile ({ commit }, file) {
    commit('SET_CURRENTSELECTBOOK_FILE', file)
  }
}

export default {
  state,
  mutations,
  actions
}
