<template>
  <v-app>
    <v-app-bar dense app color="dark" dark clipped-right ref="appBar">
      <div class="d-flex align-center">Roll Play Stage</div>

      <v-spacer></v-spacer>
      <v-btn v-if="!user" @click="showLogin = true">Sign In</v-btn>
      <v-menu v-else offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-avatar v-bind="attrs" v-on="on" elevation="40" size="38"
            ><v-img
              :alt="user.displayName.charAt(0)"
              gradient="to bottom, rgba(79, 162, 76, 0.5), rgba(79, 76, 162, 0.5)"
              :src="user.photoURL"
            ></v-img
          ></v-avatar> </template
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

      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" app persistent right clipped>
      <SidePanel />
    </v-navigation-drawer>
    <v-main>
      <!-- <Canvas /> -->
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
