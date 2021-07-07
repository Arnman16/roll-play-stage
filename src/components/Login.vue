<template>
  <div>
    <section id="firebaseui-auth-container"></section>
    <section id="loader">Loading...</section>
  </div>
</template>


<script>
import { firebase, auth } from "../db";
var firebaseui = require("firebaseui");
import "firebaseui/dist/firebaseui.css";

export default {
  name: "Login",
  computed: {
    user() {
      return this.$store.getters.user;
    },
  },
  watch: {
    user(val) {
      if (val === null) {
        console.log("load auth");
        this.loadAuth();
      }
    },
  },
  data() {
    return {
      firebaseUi: {},
      firebaseUiConfig: {
        callbacks: {
          // eslint-disable-next-line no-unused-vars
          signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            return false;
          },
          uiShown: function () {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById("loader").style.display = "none";
          },
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: "popup",
        signInSuccessUrl: "/",
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
        ],
        // Terms of service url.
        tosUrl: "<your-tos-url>",
        // Privacy policy url.
        privacyPolicyUrl: "<your-privacy-policy-url>",
      },
    };
  },
  methods: {
    loadAuth() {
      this.firebaseUi.start(
        "#firebaseui-auth-container",
        this.firebaseUiConfig
      );
    },
  },
  mounted() {
    this.firebaseUi = new firebaseui.auth.AuthUI(auth);
    this.loadAuth();
  },
};
</script>

<style>
html {
  overflow-y: auto;
}
</style>
