// FLags Module

const state = () => ({
  drawer: false,
  showLogin: false,
  bgMenu: false,
});

// getters
const getters = {
  drawer: (state) => {
    return state.drawer;
  },
  showLogin: (state) => {
    return state.showLogin;
  },
  bgMenu: (state) => {
    return state.bgMenu;
  },
};

// actions
const actions = {
  setBgMenu: ({ commit, state }, value) => {
    commit("SET_BG_MENU", value);
    return state.bgMenu;
  },
};

// mutations
const mutations = {
  SET_DRAWER: (state, drawerState) => {
    state.drawer = drawerState;
  },
  SET_SHOW_LOGIN: (state, val) => {
    state.showLogin = val;
  },
  SET_BG_MENU: (state, val) => {
    state.bgMenu = val;
  },
};

export default {
  namespaced: false,
  state,
  getters,
  actions,
  mutations,
};
