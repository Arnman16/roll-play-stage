<template>
  <v-app>
    <v-app-bar dense app color="dark" dark clipped-right ref="appBar">
      <div class="d-flex align-center">
        Roll Play Stage
      </div>

      <v-spacer></v-spacer>

      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" app persistent right clipped>
      <SidePanel />
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
    headerHeight: {}
  }),
  mounted() {
    this.headerHeight = this.$refs.appBar.computedOriginalHeight;
    this.$store.dispatch("setHeaderHeight", this.headerHeight );
  },
};
</script>

<style>
html {
  overflow-y: auto;
}
</style>
