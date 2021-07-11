<template>
  <v-container
    fluid
    :class="isMobile ? 'ma-0 pa-1' : 'pa-2'"
    class="content-home"
  >
    <div class="ma-5 text-center text-h4">Welcome to Roll Play Stage!</div>
    <div class="ma-5 text-center text-primary">
      This site is under construction, send me an email if you run into any
      bugs.
      <br />
      -Aaron
    </div>
    <v-row dense justify="space-around" align="center">
      <v-col :cols="isMobile ? 12 : 6" align="center" v-if="user">
        <v-hover v-slot="{ hover }">
          <v-card
            :class="{
              'on-hover': hover,
            }"
            outlined
            :to="user ? `/stages/${user.slug}` : '/'"
            color="rgba(255, 206, 13, 0.5)"
            class="ma-1"
          >
            <v-img
              :src="dice"
              :style="'opacity: 0.3'"
              class="white--text align-center"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,0.9)"
              height="200px"
            >
              <v-card-title>
                <v-spacer></v-spacer>
                <h1>Your Stage</h1>
                <v-spacer></v-spacer>
              </v-card-title>
            </v-img>
          </v-card>
        </v-hover>
      </v-col>
      <v-col :cols="isMobile ? 12 : 6" align="center" v-if="user">
        <v-hover v-slot="{ hover }">
          <v-card
            :class="{
              'on-hover': hover,
            }"
            to="/saved"
            outlined
            color="rgba(13, 168, 255, 0.5)"
            class="ma-1"
          >
            <v-img
              :src="dice"
              :style="'opacity: 0.3'"
              class="white--text align-center"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,0.9)"
              height="200px"
            >
              <v-card-title>
                <v-spacer></v-spacer>
                <h1>Saved Stages</h1>
                <v-spacer></v-spacer>
              </v-card-title>
            </v-img>
          </v-card>
        </v-hover>
      </v-col>
      <v-col cols="12" align="center">
        <v-hover v-slot="{ hover }">
          <v-card
            :class="{
              'on-hover': hover,
            }"
            to="/stages"
            outlined
            color="rgba(255, 13, 67, 0.5)"
            class="ma-1"
          >
            <v-img
              :src="dice"
              :style="'opacity: 0.3'"
              class="white--text align-center"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,0.9)"
              height="200px"
            >
              <v-card-title>
                <v-spacer></v-spacer>
                <h1>All Stages</h1>
                <v-spacer></v-spacer>
              </v-card-title>
            </v-img>
          </v-card>
        </v-hover>
      </v-col>
      <v-col align="center" class="ma-5"></v-col>
    </v-row>
  </v-container>
</template>

<script>
const dice = require("../assets/home/dice2.png");
export default {
  name: "Home",
  components: {},
  computed: {
    user() {
      return this.$store.getters.user;
    },
    isMobile() {
      return this.$vuetify.breakpoint.xs;
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
  data() {
    return {
      dice: dice,
    };
  },
  methods: {},
  mounted() {
    this.loading = false;
    console.log(this.$vuetify.breakpoint.mobile);
    console.log(this.$vuetify.breakpoint);
  },
};
</script>
<style scoped>
.v-card {
  opacity: 0.8;
  transition: opacity 0.1s ease-in-out;
}

.v-card:not(.on-hover) {
  opacity: 0.7;
  filter: grayscale(50%);
}
.content-home {
  margin: auto;
  max-width: 760px;
  color: rgb(207, 213, 223);
  overflow-y: clip;
}
.content-home-mobile {
  margin: 12px;
  padding: 12px;
}
html {
  overflow-y: auto;
  /* font-family: "Roboto"; */
}
</style>