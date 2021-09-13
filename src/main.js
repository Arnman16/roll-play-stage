import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import store from "./store";
import { auth } from "./db";
import Vue2TouchEvents from "vue2-touch-events";
import VuePageTitle from "vue-page-title";

Vue.use(Vue2TouchEvents, {
  namespace: "touchy",
  disableClick: true,
});

Vue.use(VuePageTitle, {
  suffix: " | Roll Play Stage",
  router,
});

Vue.config.productionTip = false;

let app;
auth.onAuthStateChanged((user) => {
  if (!app) {
    app = new Vue({
      vuetify,
      router,
      store,
      render: (h) => h(App),
    }).$mount("#app");
  }
  if (user) {
    // store.dispatch("fetchUser", user);
    store.dispatch("authCheck");
  }
});
