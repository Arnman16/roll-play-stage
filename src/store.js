import Vue from "vue";
import Vuex from "vuex";
import * as fb from "./db";
import { backupRandomPageName, randomPageName, slugify } from "./assets/words"
import router from "./router";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    count: 0,
    hello: "WORLD",
    fetchingUser: false,
    headerHeight: 0,
    selected: {},
    welcomeDialog: false,
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
    user: null,
    stage: null,
    activeUsers: [],
    loading: true,
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
    welcomeDialog: (state) => {
      return state.welcomeDialog;
    },
    user: (state) => {
      return state.user;
    },
    fetchingUser: (state) => {
      return state.fetchingUser;
    },
    stage: (state) => {
      return state.stage;
    },
    activeUsers: (state) => {
      return state.activeUsers;
    },
    loading: (state) => {
      return state.loading;
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
    SET_WELCOME_DIALOG: (state, val) => {
      state.welcomeDialog = val;
    },
    SET_USER: (state, val) => {
      state.user = val;
    },
    SET_FETCHING_USER: (state, val) => {
      state.fetchingUser = val;
    },
    SET_STAGE: (state, val) => {
      state.stage = val;
    },
    SET_ACTIVE_USERS: (state, val) => {
      state.activeUsers = val;
    },
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    // other mutations
  },
  actions: {
    setSelected: ({ commit, state }, newSelection) => {
      commit("SET_SELECTED", newSelection);
      return state.selected;
    },
    setActiveUsers: ({ commit, state }, newUsers) => {
      commit("SET_ACTIVE_USERS", newUsers);
      return state.activeUsers;
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
    setWelcomeDialog: ({ commit, state }, val) => {
      commit("SET_WELCOME_DIALOG", val);
      return state.welcomeDialog;
    },
    setActiveBackground: ({ commit, state }, newBackground) => {
      commit("SET_ACTIVE_BACKGROUND", newBackground);
      return state.activeBackground;
    },
    setUser: ({ commit, state }, val) => {
      commit("SET_USER", val);
      commit("SET_LOADING", false);
      return state.user;
    },
    setStage: ({ commit, state }, val) => {
      commit("SET_STAGE", val);
      commit("SET_LOADING", false);
      return state.stage;
    },
    signOut: ({ commit }) => {
      fb.auth.signOut()
        .then(() => {
          commit("SET_USER", null);
          if (router.currentRoute.path !== "/") router.push("/");
        })
        .catch((error) => {
          console.error(error);
          // An error happened.
        });
    },
    async authCheck({ dispatch, commit, state }) {
      if (state.fetchingUser) return;
      if (fb.auth.currentUser) {
        commit("SET_FETCHING_USER", true);
        await dispatch("fetchUser", fb.auth.currentUser);
      }
      else console.log("oops");
    },
    async fetchUser({ commit, dispatch }, user) {
      commit("SET_LOADING", true);
      console.log('fetch user');
      try {
        if (user) {
          user.isAuthenticated = true;
          let thisUser = await fb.usersCollection.doc(user.uid).get();
          if (!thisUser.exists) {
            let pageName = randomPageName;
            let slug = slugify(pageName);
            var searchSlug = await fb.usersCollection.where("slug", "==", slug).get()
              .then(() => {
                commit("SET_FETCHING_USER", false);
              });
            if (searchSlug.size !== 0) {
              console.log('dupe page name');
              randomPageName = backupRandomPageName;
              slug = slugify(randomPageName);
            }
            const newUser = {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              pageName: randomPageName,
              slug: slug,
            }
            fb.usersCollection.doc(user.uid).set(newUser).then(() => {
              const stageRef = fb.db.database().ref(`stage/${slug}`);
              stageRef.set({ owner: user.uid });
              dispatch("setUser", newUser);
            });
          }
          else {
            dispatch("setUser", thisUser.data());
            commit("SET_FETCHING_USER", false);
          }
        }
        else {
          console.log('setting user null')
          dispatch("setUser", null);
          commit("SET_FETCHING_USER", false);
        }
      } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.email;
        const credential = error.credential;
        dispatch("setUser", null);
        console.log(errorCode, errorMessage, email, credential);
        commit("SET_FETCHING_USER", false);
      }
    },
    async fetchStage({ commit, state, dispatch }, slug) {
      commit("SET_LOADING", true);
      console.log("fetch stage");
      await fb.usersCollection.where("slug", "==", slug).get()
        .then((result) => {
          if (result.size === 0) {
            console.log('stage not found');
            dispatch("setStage", null);
          }
          else {
            const stage = result.docs[0].data()
            dispatch("setStage", stage);
            let user = state.user;
            if (user) {
              user.viewing = stage.slug;
              dispatch("setUser", user);
            }
          }
        })
    },
    // other actions
  },
});
