import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    count: 0,
    hello: "WORLD",
    selected: {},
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
  },
  mutations: {
    SET_SELECTED: (state, newSelection) => {
      state.selected = newSelection;
    },
    SET_BACKGROUNDS: (state, newBackgrounds) => {
      state.backgrounds = newBackgrounds;
    },
    SET_ACTIVE_BACKGROUND: (state, newBackground) => {
      state.activeBackground = newBackground;
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
    setActiveBackground: ({ commit, state }, newBackground) => {
      commit("SET_ACTIVE_BACKGROUND", newBackground);
      return state.activeBackground;
    },
    // other actions
  },
});
