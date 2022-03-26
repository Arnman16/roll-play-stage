<template>
  <v-dialog scrollable v-model="show" max-width="500px">
    <v-card class="mx-auto pa-1" color="grey darken-3">
      <v-toolbar dense flat>
        <v-toolbar-title small class="mx-auto">My Tokens</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text style="height: 500px;">
        <v-row class="mt-2">
          <v-col
            v-for="(token, index) in tokenSample"
            :key="index"
            class="d-flex child-flex"
            cols="4"
            ><v-card>
              <draggable @end="onDragEnd" @start="onDragStart(token)">
                <v-img :src="token" :lazy-src="tokenSample[0]" aspect-ratio="1">
                  <template v-slot:placeholder>
                    <v-row
                      class="fill-height ma-0"
                      align="center"
                      justify="center"
                    >
                      <v-progress-circular
                        indeterminate
                        color="grey lighten-5"
                      ></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
              </draggable>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import tokenList from "../assets/tokens";
import draggable from "vuedraggable";
import { db } from "../db";

export default {
  components: {
    draggable,
  },
  props: {
    value: Boolean,
  },
  computed: {
    show: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
    activeBackground() {
      return this.$store.getters.activeBackground;
    },
    stage() {
      return this.$store.getters.stage;
    },
    slug() {
      return this.$route.params.slug;
    },
    user() {
      return this.$store.getters.user;
    },
    isOwner() {
      if (!this.user) return null;
      return this.user.uid === this.stage.owner;
    },
  },
  data() {
    return {
      tokenList: tokenList,
      tokenSample: [],
      tokenAdded: {
        stage: "",
        owner: "",
        name: "",
        url: "",
        angle: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        hasAccess: "",
        originX: "center",
        originY: "center",
        race: "",
        notes: "",
        deletable: true,
        selectable: true,
        crossOrigin: "anonymous",
        filters: {
          type: "BlendColor",
          color: "a8000000",
          mode: "tint",
          alpha: 0,
        },
        evented: true,
      },
    };
  },
  methods: {
    onDragStart(url) {
      this.tokenAdded.url = url;
      // console.log(token);
    },
    onDragEnd(e) {
      console.log(e.originalEvent);
      var headerHeight = this.$store.getters.headerHeight;
      var vpt = this.$store.getters.viewport;
      var mouseX = e.originalEvent.x;
      var mouseY = e.originalEvent.y;
      this.tokenAdded.left = (mouseX - vpt[4]) / vpt[0];
      this.tokenAdded.top = (mouseY - headerHeight - vpt[5]) / vpt[0];
      this.tokenAdded.stage = this.stage.slug;
      this.tokenAdded.owner = this.stage.owner;

      const slug = `users/${this.stage.owner}/stages/${this.stage.slug}`;
      const bgSlug = slug + "/backgrounds/" + this.activeBackground.__id;
      const tokenRef = db.database().ref(bgSlug + "/tokens");
      tokenRef.push(this.tokenAdded);
    },
  },
  mounted() {
    this.tokenSample = this.tokenList.slice(0, 100);
  },
};
</script>
<style>
.max {
  width: 100vw;
  height: 100vh;
}
</style>
