<template>
  <v-app>
    <v-app-bar
      app
      color="rgba(26,26,26,1)"
      class="px-0"
      dark
      clipped-right
      ref="appBar"
    >
      <div>
        <v-hover v-slot="{ hover }">
          <v-card
            :class="{
              'on-hover': hover,
            }"
            color="transparent"
            flat
            tile
            to="/"
            class="ma-1"
          >
            <v-img
              :max-height="headerHeight - 10"
              :max-width="headerHeight - 10"
              :src="logo"
              to="/"
            ></v-img>
          </v-card>
        </v-hover>
        <!-- Roll Play Stage -->
      </div>
      <v-slide-x-transition hide-on-leave>
        <div v-show="route == 'Home'" class="mx-3 text-h5">Roll Play Stage</div>
      </v-slide-x-transition>
      <v-slide-x-transition hide-on-leave>
        <div v-show="route == 'Stages'" class="mx-3 text-h5">Stages</div>
      </v-slide-x-transition>
      <v-slide-x-transition hide-on-leave v-if="!isMobile">
        <div v-show="route == 'Stage'" class="mx-3 text-h5" v-text="stage ? `Stage - ${stage.pageName}` : 'Stage - '"></div>
      </v-slide-x-transition>
      <!-- <v-spacer></v-spacer>
      <v-card
        rounded
        disabled
        v-if="stage && !isMobile"
        tile
        elevation="10"
        color="grey darken-4"
        class="ma-1"
      >
        <div class="mx-5">
          <h3 class="text-primary">
            {{ stage.pageName }}
          </h3>
        </div>
      </v-card> -->
      <v-spacer></v-spacer>
      <v-btn
        fab
        x-small
        transition="fab-transition"
        v-for="(item, uid) in activeUsers"
        :key="uid"
        elevation="40"
        :to="'/stages/' + item.slug"
        class="ma-1"
        :depressed="item.slug == slug"
        :disabled="item.slug == slug"
        :show="item"
      >
        <v-avatar size="28"
          ><v-img
            :alt="item.displayName.charAt(0)"
            gradient="to bottom, rgba(79, 162, 76, 0.2), rgba(79, 76, 162, 0.2)"
            :src="item.photoURL"
          ></v-img
        ></v-avatar>
      </v-btn>
      <v-btn v-if="!user" @click="showLogin = true">Sign In</v-btn>
      <div v-else>
        <v-menu offset-y open-on-hover tile nudge-bottom="7" close-delay="100">
          <template v-slot:activator="{ on, attrs }">
            <v-btn elevation="40" v-bind="attrs" v-on="on" class="ma-1">
              <v-avatar elevation="40" size="32"
                ><v-img
                  :alt="user.displayName.charAt(0)"
                  gradient="to bottom, rgba(79, 162, 76, 0.4), rgba(79, 76, 162, 0.4)"
                  :src="user.photoURL"
                ></v-img></v-avatar
              ><v-icon>mdi-menu-down</v-icon></v-btn
            ></template
          ><v-list class="mx-auto">
            <v-list-item dense :to="'/stages/' + user.slug">
              <v-list-item-icon class="mx-2">
                <v-icon v-text="'mdi-file-table-box'"></v-icon>
              </v-list-item-icon>
              <v-list-item-title class="mx-5">My Stage</v-list-item-title>
            </v-list-item>

            <v-list-item dense to="/saved">
              <v-list-item-icon class="mx-2">
                <v-icon v-text="'mdi-cards-heart'"></v-icon>
              </v-list-item-icon>
              <v-list-item-title class="mx-5">Saved</v-list-item-title>
            </v-list-item>

            <v-list-item dense to="/user">
              <v-list-item-icon class="mx-2">
                <v-icon v-text="'mdi-account-circle'"></v-icon>
              </v-list-item-icon>
              <v-list-item-title class="mx-5">Profile</v-list-item-title>
            </v-list-item>

            <v-list-item dense to="/settings">
              <v-list-item-icon class="mx-2">
                <v-icon v-text="'mdi-account-cog'"></v-icon>
              </v-list-item-icon>
              <v-list-item-title class="mx-5">Settings</v-list-item-title>
            </v-list-item>

            <v-list-item dense @click="signOut">
              <v-list-item-icon class="mx-2">
                <v-icon v-text="'mdi-logout'"></v-icon>
              </v-list-item-icon>
              <v-list-item-title class="mx-5">Sign Out</v-list-item-title>
            </v-list-item>
          </v-list></v-menu
        >
      </div>

      <v-app-bar-nav-icon
        v-if="slug"
        @click.stop="drawer = !drawer"
      ></v-app-bar-nav-icon>
    </v-app-bar>
    <v-navigation-drawer
      v-if="slug"
      v-model="drawer"
      app
      persistent
      right
      fixed
      clipped
      floating
      color="rgba(26,26,26,0.9)"
    >
      <v-card
        rounded
        disabled
        tile
        elevation="10"
        v-if="stage"
        color="blue-grey darken-4"
        class="ma-1"
      >
        <v-card-title class="mx-auto pa-2">
          <h4 class="mx-auto">
            {{ stage.pageName }}
          </h4>
        </v-card-title>
      </v-card>
      <SidePanel />
    </v-navigation-drawer>
    <v-main class="pb-0 bb-0">
      <router-view></router-view>
    </v-main>
    <v-dialog v-model="showLogin" persistent max-width="600px">
      <v-card class="mx-auto pa-0" color="grey darken-3">
        <v-toolbar dense flat>
          <v-toolbar-title small class="mx-auto">Sign In</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="showLogin = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-sheet class="pa-3">
          <Login />
        </v-sheet>
      </v-card>
    </v-dialog>
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
import Login from "./components/Login";
const logo = require("./assets/logo.svg");

export default {
  name: "App",
  components: {
    // Canvas2,
    // Canvas,
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
    slug() {
      return this.$route.params.slug;
    },
    route() {
      return this.$route.name;
    },
    activeUsers() {
      return this.$store.getters.activeUsers;
    },
    stage() {
      return this.$store.getters.stage;
    },
    isMobile() {
      return this.$vuetify.breakpoint.xs;
    },
  },
  watch: {
    user(val) {
      if (val !== null) {
        this.showLogin = false;
      }
    },
  },
  data: () => ({
    drawer: false,
    headerHeight: {},
    showLogin: false,
    logo: logo,
  }),
  methods: {
    signOut() {
      this.$store.dispatch("signOut");
    },
  },
  mounted() {
    this.headerHeight = this.$refs.appBar.computedOriginalHeight;
    this.$store.dispatch("setHeaderHeight", this.headerHeight);
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
.v-card {
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}

.v-card:not(.on-hover) {
  opacity: 0.9;
  filter: grayscale(50%);
}
</style>
