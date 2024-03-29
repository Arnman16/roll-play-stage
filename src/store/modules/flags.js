// FLags Module

const state = () => ({
  drawer: false,
  showLogin: false,
  bgMenu: false,
  isSessionActive: true,
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
  isSessionActive: (state) => {
    return state.isSessionActive;
  },
};

// actions
const actions = {
  setBgMenu: ({ commit, state }, value) => {
    commit("SET_BG_MENU", value);
    return state.bgMenu;
  },
  setIsSessionActive: ({ commit, state }, value) => {
    commit("SET_IS_SESSION_ACTIVE", value);
    return state.isSessionActive;
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
  SET_IS_SESSION_ACTIVE: (state, val) => {
    state.isSessionActive = val;
  },
};

export default {
  namespaced: false,
  state,
  getters,
  actions,
  mutations,
};
