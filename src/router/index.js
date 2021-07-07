import VueRouter from "vue-router";
import Vue from "vue";
// import { auth } from '../db'
import Home from "@/components/Home.vue"
import About from "@/components/About.vue";
import Login from "@/components/Login.vue";
import Signup from "@/components/Signup.vue";
import Stage from "@/components/Stage.vue";
import Stages from "@/components/Stages.vue";
import NotFound from "@/components/NotFound.vue";
// import Unpublished from "@/components/Unpublished.vue";
// import UnpublishedPost from "@/components/UnpublishedPost.vue";
// import Edit from "@/components/Edit.vue";
import store from "@/store";

Vue.use(VueRouter);

const ifNotAuthenticated = (to, from, next) => {
  if (store.getters.user === null) {
    next();
    return;
  }
  next("/");
};

const ifAuthenticated = (to, from, next) => {
  if (store.getters.user.isAuthenticated) {
    next();
    return;
  }
  // let user = auth.currentUser;
  store
    .dispatch("authCheck")
    .then(function () {
      if (store.getters.user.isAuthenticated) {
        next();
        return;
      } else {
        next("/login");
      }
    })
    .catch(function (error) {
      console.log(error);
    });
};

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
  {
    path: "/stages",
    name: "Stages",
    component: Stages,
  },
  {
    path: "/stages/:slug",
    name: "Stage",
    component: Stage,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    beforeEnter: ifNotAuthenticated,
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup,
    beforeEnter: ifAuthenticated,
  },
  {
    path: "/*",
    name: "404",
    component: NotFound,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
  // eslint-disable-next-line no-unused-vars
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
});

export default router;
