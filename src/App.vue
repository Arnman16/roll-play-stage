<template>
  <v-app>
    <v-app-bar app color="dark" dark>
      <div class="d-flex align-center">
        <!-- LOGO -->
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />

        Roll Play Stage
      </div>

      <v-spacer></v-spacer>

      <v-btn href="#" target="_blank" text>
        <span class="mr-2">NAME HOLDER</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-row>
        <v-col>
          <Canvas />
        </v-col>
        <v-col>
          <SidePanel />
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
import Canvas from "./components/Canvas";
import SidePanel from "./components/SidePanel";

export default {
  name: "App",

  components: {
    Canvas, SidePanel,
  },

  data: () => ({
    //
  }),
};
</script>
