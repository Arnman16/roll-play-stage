<template>
  <v-app-bar
    app
    color="rgba(26,26,26,1)"
    class="px-0"
    dark
    clipped-right
    ref="appBar"
  >
    <v-row justify="space-around" align="center">
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
      <v-slide-x-transition hide-on-leave>
        <div v-show="route == 'Home'" class="mx-3 text-h5">Roll Play Stage</div>
      </v-slide-x-transition>
      <v-slide-x-transition hide-on-leave>
        <div v-show="route == 'Stages'" class="mx-3 text-h5">Stages</div>
      </v-slide-x-transition>
      <v-slide-x-transition hide-on-leave v-if="!isMobile"
        ><v-col class="justify-center" v-if="stage">
          <span
            v-show="route == 'Stage'"
            class="mx-3 text-h5 by-auto"
            v-text="stage ? `Stage - ${stage.pageName}` : 'Stage - '"
          >
          </span
          ><v-btn icon @click.prevent="stageSaved = !stageSaved"
            ><v-icon>{{ stageSaved ? "mdi-star" : "mdi-star-outline" }}</v-icon>
          </v-btn>
        </v-col>
      </v-slide-x-transition>
      <v-slide-x-transition hide-on-leave v-if="!isMobile">
        <div
          v-show="route == 'Saved'"
          class="mx-3 text-h5"
          v-text="'Saved'"
        ></div>
      </v-slide-x-transition>
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
    </v-row>
    <v-app-bar-nav-icon
      v-if="slug"
      @click.stop="drawer = !drawer"
    ></v-app-bar-nav-icon>
  </v-app-bar>
</template>

<script>
const logo = require("../assets/logo.svg");
import { mapGetters } from "vuex";
export default {
  name: "AppBar",
  computed: {
    ...mapGetters({
      user: "user",
      activeUsers: "activeUsers",
      stage: "stage",
      headerHeight: "headerHeight",
    }),
    isMobile() {
      return this.$vuetify.breakpoint.xs;
    },
    route() {
      return this.$route.name;
    },
    slug() {
      return this.$route.params.slug;
    },
    drawer: {
      get() {
        return this.$store.getters.drawer;
      },
      set(drawerState) {
        this.$store.commit("SET_DRAWER", drawerState);
      },
    },
    showLogin: {
      get() {
        return this.$store.getters.showLogin;
      },
      set(showLogin) {
        this.$store.commit("SET_SHOW_LOGIN", showLogin);
      },
    },
    stageSaved: {
      get() {
        return this.$store.getters.stageSaved;
      },
      set(isSaved) {
        this.$store.commit("SET_STAGE_SAVED", isSaved);
      },
    },
  },
  methods: {
    signOut() {
      this.$store.dispatch("signOut");
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
    logo: logo,
  }),
  mounted() {
    const headerHeight = this.$refs.appBar.computedOriginalHeight;
    this.$store.dispatch("setHeaderHeight", headerHeight);
  },
};
</script>

<style>
.v-card {
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}

.v-card:not(.on-hover) {
  opacity: 0.9;
  filter: grayscale(50%);
}
</style>