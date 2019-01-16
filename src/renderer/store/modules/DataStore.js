const state = {
  workspacePath: '',
  currentSelectBook: {
    name: 'ceshi1',
    path: '1231'
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
    state.currentSelectBook.name = name
  },
  SET_CURRENTSELECTBOOK_PATH (state, path) {
    state.currentSelectBook.path = path
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
  }
}

export default {
  state,
  mutations,
  actions
}
