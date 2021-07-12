
<template>
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
        <FirebaseUi />
      </v-sheet>
    </v-card>
  </v-dialog>
</template>


<script>
import FirebaseUi from "./FirebaseUi.vue";
import "firebaseui/dist/firebaseui.css";

export default {
  name: "Login",
  components: {
    FirebaseUi,
  },
  computed: {
    showLogin: {
      get() {
        return this.$store.getters.showLogin;
      },
      set(showLogin) {
        this.$store.commit("SET_SHOW_LOGIN", showLogin);
      },
    },
    loading: {
      get() {
        return this.$store.getters.loading;
      },
      set(val) {
        this.$store.commit("SET_LOADING", val);
      },
    },
  },
};
</script>

<style>
html {
  overflow-y: auto;
}
</style>
