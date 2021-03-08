import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        count: 0,
        hello: 'WORLD',
        selected: {},
    },
    getters: {
        selected: (state) => {
            return state.selected;
        },
    },
    mutations: {
        SET_SELECTED: (state, newSelection) => {
            state.selected = newSelection;
        },
        // other mutations
    },
    actions: {
        setSelected: ({ commit, state }, newSelection) => {
            commit('SET_SELECTED', newSelection)
            return state.selected
        },
        // other actions
    }
})