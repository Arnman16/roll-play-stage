import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    count: 0,
    hello: "WORLD",
    headerHeight: 0,
    selected: {},
    editTokenDialog: false,
    backgrounds: [
      {
        name: "",
        url: "",
        id: "",
      },
    ],
    activeBackground: {
      name: "",
      url: "",
      id: "",
    },
  },
  getters: {
    selected: (state) => {
      return state.selected;
    },
    backgrounds: (state) => {
      return state.backgrounds;
    },
    activeBackground: (state) => {
      return state.activeBackground;
    },
    headerHeight: (state) => {
      return state.headerHeight;
    },
    editTokenDialog: (state) => {
      return state.editTokenDialog;
    },
  },
  mutations: {
    SET_SELECTED: (state, newSelection) => {
      state.selected = newSelection;
    },
    SET_HEADER_HEIGHT: (state, newHeight) => {
      state.headerHeight = newHeight;
    },
    SET_BACKGROUNDS: (state, newBackgrounds) => {
      state.backgrounds = newBackgrounds;
    },
    SET_ACTIVE_BACKGROUND: (state, newBackground) => {
      state.activeBackground = newBackground;
    },
    SET_EDIT_TOKEN_DIALOG: (state, val) => {
      state.editTokenDialog = val;
    },
    // other mutations
  },
  actions: {
    setSelected: ({ commit, state }, newSelection) => {
      commit("SET_SELECTED", newSelection);
      return state.selected;
    },
    setBackgrounds: ({ commit, state }, newBackgrounds) => {
      commit("SET_BACKGROUNDS", newBackgrounds);
      return state.backgrounds;
    },
    setHeaderHeight: ({ commit, state }, newHeight) => {
      commit("SET_HEADER_HEIGHT", newHeight);
      return state.headerHeight;
    },
    setEditTokenDialog: ({ commit, state }, val) => {
      commit("SET_EDIT_TOKEN_DIALOG", val);
      return state.editTokenDialog;
    },
    setActiveBackground: ({ commit, state }, newBackground) => {
      commit("SET_ACTIVE_BACKGROUND", newBackground);
      return state.activeBackground;
    },
    // other actions
  },
});
