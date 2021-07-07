<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4>
        <v-card color="rgba(255,255,255,0.05)" class="mx-auto ma-3">
          <v-toolbar color="rgba(255,255,255,0.05)" flat class="mx-auto ma-3">
            <v-toolbar-title>New User</v-toolbar-title>
          </v-toolbar>
          <form @submit.prevent="userLogin">
            <v-card-text>
              <v-text-field
                prepend-icon="mdi-account"
                name="name"
                label="Name"
                type="text"
                autocomplete="name"
                v-model="user.name"
              ></v-text-field>
              <v-text-field
                prepend-icon="mdi-account"
                name="email"
                label="Email"
                type="email"
                autocomplete="username"
                v-model="user.email"
              ></v-text-field>
              <v-text-field
                prepend-icon="mdi-account"
                name="site"
                label="Site"
                type="text"
                autocomplete="site"
                v-model="user.site"
              ></v-text-field>
              <v-text-field
                id="password"
                prepend-icon="mdi-lock"
                name="password"
                label="Password"
                type="password"
                autocomplete="new-password"
                v-model="user.password"
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                elevation="0"
                outlined
                type="submit"
                :style="'border: 1px solid rgba(255,255,255,0.5);'"
                @click.prevent="signup"
                >Sign Up</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </form>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
// import firebase from "firebase";
export default {
  name: "Signup",
  data() {
    return {
      user: {
        email: "",
        password: "",
        name: "",
        site: "",
      },
    };
  },
  methods: {
    signup() {
      this.$store.dispatch("signup", {
        email: this.user.email,
        password: this.user.password,
        name: this.user.name,
        site: this.user.site,
      });
    },
  },
  created() {
    // console.log(db);
  },
  mounted() {
    // this.db = db;
  },
};
</script>
