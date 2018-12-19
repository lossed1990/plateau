const state = {
  leftToolBarWidth: 66
}

const mutations = {
  SET_LEFTTOOLBAR_WIDTH (state, width) {
    state.leftToolBarWidth = width
  }
}

const actions = {
  setLeftToolBarWidth ({ commit }, width) {
    commit('SET_LEFTTOOLBAR_WIDTH', width)
  }
}

export default {
  state,
  mutations,
  actions
}
