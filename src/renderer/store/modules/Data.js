const state = {
  workspacePath: ''
}

const mutations = {
  RESET_WORKSPACE_PATH (state) {
    state.workspacePath = ''
  },
  SET_WORKSPACE_PATH (state, path) {
    state.workspacePath = path
  }
}

const actions = {
  updateWorkspacePath ({ commit }, path) {
    commit('SET_WORKSPACE_PATH', path)
  }
}

export default {
  state,
  mutations,
  actions
}
