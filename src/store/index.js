import Vue from "vue";
import Vuex from "vuex";
import flags from "./modules/flags"
import root from "./modules/root"

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    flags,
    root,
  }
});
