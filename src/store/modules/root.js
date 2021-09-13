import * as fb from "../../db";
import router from "../../router";
import { randomPageName, slugify } from "../../assets/words"

const state = () => ({
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
  isAuthenticated: false,
  stage: null,
  stageSaved: false,
  activeUsers: [],
  loading: true,
})

// getters
const getters = {
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
  isAuthenticated: (state) => {
    return state.isAuthenticated;
  },
  stage: (state) => {
    return state.stage;
  },
  stageSaved: (state) => {
    return state.stageSaved;
  },
  activeUsers: (state) => {
    return state.activeUsers;
  },
  loading: (state) => {
    return state.loading;
  },
}

// actions
const actions = {
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
    if (!val) {
      commit("SET_IS_AUTHENTICATED", false);
    }
    else if (val.uid) {
      commit("SET_IS_AUTHENTICATED", true);
    }
    commit("SET_USER", val);
    commit("SET_LOADING", false);
    return state.user;
  },
  setStage: ({ commit, state }, val) => {
    commit("SET_STAGE", val);
    commit("SET_LOADING", false);
    return state.stage;
  },
  signOut: ({ dispatch }) => {
    fb.auth.signOut()
      .then(() => {
        dispatch("setUser", null);
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
  async setStageSaved({ state, commit }, isSaved) {
    console.log('set stage saved', isSaved);
    const saveFolder = fb.fs.collection(`users/${state.user.uid}/savedStages`);
    if (isSaved) {
      saveFolder.doc(state.stage.slug).set(state.stage).then(() => {
        console.log('Stage saved')
        commit('SET_STAGE_SAVED', true);
      })
        .catch(error => {
          console.log("error saving stage", error);
        })
    }
    else {
      const doc = saveFolder.doc(state.stage.slug)
      const stage = await doc.get()
        .catch(error => {
          console.log("User Save ref error", error);
        });

      if (!stage) return;
      doc.delete()
        .then(() => { commit('SET_STAGE_SAVED', false) })
        .catch(error => {
          console.log("error removing stage from saved", error);
        });
    }
  },
  async fetchUser({ commit, dispatch }, user) {
    commit("SET_LOADING", true);
    console.log('fetch user');
    try {
      if (user) {
        user.isAuthenticated = true;
        let thisUser = await fb.usersCollection.doc(user.uid).get()
          .catch((error) => {
            console.log('Error fetching User', error);
          });
        if (!thisUser.exists) {
          let pageName = randomPageName;
          let slug = slugify(pageName);
          let timestamp = fb.firebase.database.ServerValue.TIMESTAMP;
          // when I have to worry about dupes later
          // fb.usersCollection.where("slug", "==", slug).get()
          //   .then((result) => {
          //     commit("SET_FETCHING_USER", false);
          //     if (result.val()) {
          //       console.log('dupe page name');
          //       pageName = backupRandomPageName;
          //       slug = slugify(pageName);
          //     }
          //   });
          const newUser = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            slug: slug,
            created: timestamp,
          };
          const newStage = {
            owner: user.uid,
            ownerName: user.displayName,
            pageName: pageName,
            slug: slug,
            created: timestamp,
          };
          fb.usersCollection.doc(user.uid).set(newUser).then(() => {
            dispatch("setUser", newUser);
            fb.stagesCollection.add(newStage);
            const userStage = fb.db.database().ref(`users/${user.uid}/stages/${slug}`);
            const defaultRef = fb.db.database().ref("default");
            defaultRef.once("value")
              .then((snapshot) => {
                userStage.set(snapshot.val())
              })
              .catch((error) => {
                console.log("New User", error);
              });
          })
            .catch((error) => {
              console.log("New User", error);
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
    fb.stagesCollection.where("slug", "==", slug).get()
      .then((result) => {
        if (result.size === 0) {
          console.log('stage not found');
          dispatch("setStage", null);
        }
        else {
          console.log('setting stage');
          let stage = result.docs[0].data();
          stage.id = result.docs[0].id;
          dispatch("setStage", stage);
          let user = state.user;
          if (user) {
            user.viewing = stage.slug;
            dispatch("setUser", user);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching stage", error);
      });
  },
}

// mutations
const mutations = {
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
  SET_IS_AUTHENTICATED: (state, val) => {
    state.isAuthenticated = val;
  },
  SET_FETCHING_USER: (state, val) => {
    state.fetchingUser = val;
  },
  SET_STAGE: (state, val) => {
    state.stage = val;
  },
  SET_STAGE_SAVED: (state, val) => {
    state.stageSaved = val;
  },
  SET_ACTIVE_USERS: (state, val) => {
    state.activeUsers = val;
  },
  SET_LOADING(state, isLoading) {
    state.loading = isLoading;
  },
}

export default {
  namespaced: false,
  state,
  getters,
  actions,
  mutations
}