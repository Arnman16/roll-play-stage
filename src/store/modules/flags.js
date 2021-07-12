// FLags Module

const state = () => ({
  drawer: false,
  showLogin: false,
})

// getters
const getters = {
  drawer: (state) => {
    return state.drawer;
  },
  showLogin: (state) => {
    return state.showLogin;
  },
}

// actions
const actions = {

}

// mutations
const mutations = {
  SET_DRAWER: (state, drawerState) => {
    state.drawer = drawerState;
  },
  SET_SHOW_LOGIN: (state, val) => {
    state.showLogin = val;
  },
}

export default {
  namespaced: false,
  state,
  getters,
  actions,
  mutations
}