<template>
  <v-app>
    <v-app-bar dense app color="dark" dark clipped-right>
      <div class="d-flex align-center">
        <!-- LOGO -->
        <!-- <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        /> -->

        Roll Play Stage
      </div>

      <v-spacer></v-spacer>

      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" app persistent right clipped>
      <SidePanel />
      <!-- <v-list nav dense>
        <v-list-item-group
          active-class="deep-purple--text text--accent-4"
        >
          <v-list-item>
            <v-list-item-title>Foo</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Bar</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Fizz</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Buzz</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list> -->
    </v-navigation-drawer>
    <v-main>
      <Canvas />
    </v-main>
  </v-app>
</template>

<script>
import Canvas from "./components/Canvas";
import SidePanel from "./components/SidePanel";

export default {
  name: "App",
  components: {
    Canvas,
    SidePanel,
  },

  data: () => ({
    drawer: false,
  }),
};
</script>

<style>
html {
  overflow-y: auto;
}
</style>
