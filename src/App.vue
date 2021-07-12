<template>
  <v-app>
      <AppBar />

      <SidePanel />
    
    <v-main class="pb-0 bb-0">
      <router-view></router-view>
    </v-main>

          <Login />

    <v-dialog v-model="loading" hide-overlay fullscreen hide-on-leave>
      <v-container fluid fill-height>
        <v-row justify="space-around" align="center">
          <v-col align="center">
            <v-progress-circular
              :style="{ 'z-index': 2 }"
              class="mx-auto"
              size="70"
              color="00ffff"
              indeterminate
            ></v-progress-circular>
          </v-col>
        </v-row>
      </v-container>
    </v-dialog>
  </v-app>
</template>

<script>
// import Canvas from "./components/Canvas";
// import Canvas2 from "./components/Canvas2";
import SidePanel from "./components/SidePanel";
import AppBar from "./components/AppBar";
import Login from "./components/Login";

export default {
  name: "App",
  components: {
    AppBar,
    SidePanel,
    Login,
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    loading() {
      return this.$store.getters.loading;
    },
    route() {
      return this.$route.name;
    },
    stage() {
      return this.$store.getters.stage;
    },
    isMobile() {
      return this.$vuetify.breakpoint.xs;
    },
  },
  data: () => ({
    drawer: false,
    showLogin: false,
  }),
  methods: {},
  mounted() {
  },
};
</script>

<style>
html {
  overflow-y: auto;
}
.theme--dark.v-btn.v-btn--disabled.v-btn--has-bg {
  background-color: rgba(255, 255, 255, 0.664) !important;
}
html {
  overflow-y: auto;
  /* font-family: "Roboto"; */
}
</style>
