<template>
  <v-app>
    <v-app-bar dense app color="dark" dark clipped-right ref="appBar">
      <div>
        <v-btn icon to="/">
          <v-icon>mdi-map-outline</v-icon>
          <!-- Roll Play Stage -->
        </v-btn>
      </div>

      <v-spacer></v-spacer>
      <div v-if="stage" class="mx-5">
        {{ stage.pageName }}
      </div>
      <v-spacer></v-spacer>
      <v-btn
        fab
        x-small
        v-for="(item, uid) in activeUsers"
        :key="uid"
        elevation="40"
        :to="'/stages/' + item.slug"
        class="ma-1"
        :depressed="item.slug == slug"
        :disabled="item.slug == slug"
      >
        <v-avatar size="23"
          ><v-img
            :alt="item.displayName.charAt(0)"
            gradient="to bottom, rgba(79, 162, 76, 0.5), rgba(79, 76, 162, 0.5)"
            :src="item.photoURL"
          ></v-img
        ></v-avatar>
      </v-btn>
      <v-btn v-if="!user" @click="showLogin = true">Sign In</v-btn>
      <div v-else>
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              fab
              small
              elevation="40"
              v-bind="attrs"
              v-on="on"
              class="ma-1"
            >
              <v-avatar elevation="40" size="38"
                ><v-img
                  :alt="user.displayName.charAt(0)"
                  gradient="to bottom, rgba(79, 162, 76, 0.5), rgba(79, 76, 162, 0.5)"
                  :src="user.photoURL"
                ></v-img
              ></v-avatar> </v-btn></template
          ><v-list>
            <v-list-item dense :to="'/stages/' + user.slug">
              <v-list-item-title>My Stage</v-list-item-title>
            </v-list-item>
            <v-list-item dense>
              <v-list-item-title>Profile</v-list-item-title>
            </v-list-item>
            <v-list-item dense>
              <v-list-item-title>Settings</v-list-item-title>
            </v-list-item>
            <v-list-item dense @click="signOut">
              <v-list-item-title>Sign Out</v-list-item-title>
            </v-list-item>
          </v-list></v-menu
        >
      </div>

      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" app persistent right clipped>
      <SidePanel />
    </v-navigation-drawer>
    <v-main>
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
    activeUsers() {
      return this.$store.getters.activeUsers;
    },
    stage() {
      return this.$store.getters.stage;
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
</style>
