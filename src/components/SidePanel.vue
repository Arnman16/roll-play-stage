<template>
  <v-navigation-drawer
    v-if="slug"
    v-model="drawer"
    app
    persistent
    right
    fixed
    clipped
    floating
    color="rgba(26,26,26,0.8)"
  >
    <v-toolbar height="35">
      <v-tabs v-model="tabModel" grow>
        <v-tabs-slider color="green"></v-tabs-slider>
        <v-tab v-if="sessionActive || isOwner" style="text-transform: none"
          ><v-icon>mdi-details</v-icon></v-tab
        >
        <v-tab style="text-transform: none"
          ><v-badge color="orange" overlap dot :value="true">
            <v-icon>mdi-message</v-icon></v-badge
          ></v-tab
        >
      </v-tabs>
    </v-toolbar>
    <v-container
      fluid
      fill-height
      style="display: block;"
      class="align-start pa-0"
    >
      <v-tabs-items
        class="transparent"
        v-model="tabModel"
        style="display: block; height: 100%;"
      >
        <v-tab-item style="height: 100%" v-if="sessionActive || isOwner">
          <StageInfo />
        </v-tab-item>
        <v-tab-item style="display: block; height: 100%;">
          <Chat />
        </v-tab-item>
      </v-tabs-items>
    </v-container>
  </v-navigation-drawer>
</template>
<script>
import Chat from "./Chat.vue";
import StageInfo from "./StageInfo";
export default {
  name: "SidePanel",
  components: {
    Chat,
    StageInfo,
  },
  data() {
    return {
      tabModel: null,
    };
  },
  computed: {
    drawer: {
      get() {
        return this.$store.getters.drawer;
      },
      set(drawerState) {
        this.$store.commit("SET_DRAWER", drawerState);
      },
    },
    slug() {
      return this.$route.params.slug;
    },

    showSelected() {
      return this.selected && this.selectionToggle;
    },
    sessionActive() {
      return this.$store.getters.isSessionActive;
    },
    isOwner() {
      return this.$store.getters.isStageOwner;
    },
  },
  methods: {},
};
</script>

<style>
html {
  overflow-y: auto;
}
</style>
