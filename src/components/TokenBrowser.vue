<template>
  <v-dialog scrollable v-model="show" max-width="500px">
    <v-card class="mx-auto pa-1" color="grey darken-3">
      <v-toolbar dense flat>
        <!-- <v-spacer></v-spacer> -->
        <v-toolbar-title class="mx-auto">
          <v-select
            :items="items"
            class="mx-auto"
            v-model="listSelected"
            label="Solo field"
            hide-details
            solo
            flat
          ></v-select>
        </v-toolbar-title>

        <!-- <v-spacer></v-spacer> -->
        <v-btn icon @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text style="height: 500px;">
        <v-row class="mt-2">
          <div v-if="!tokens.length" class="mx-auto my-5 text-subtitle-1">
            There are no tokens here :(
          </div>
          <v-col
            v-for="(token, index) in tokens"
            :key="index"
            class="d-flex child-flex"
            cols="4"
            ><v-card>
              <draggable @end="onDragEnd" @start="onDragStart(token)">
                <v-img
                  :src="token"
                  lazy-src="https://i.imgur.com/DgnTd4i.png"
                  aspect-ratio="1"
                >
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
import { db, firebase } from "../db";
import "firebase/storage";

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
  watch: {
    listSelected(value) {
      switch (value) {
        case "Tokens - Saved":
          this.fetchSavedList();
          break;
        case "Tokens - Monsters":
          this.fetchMonsterList();
          break;
        case "Tokens - Heroes1":
          this.fetchHeroList(0, "1");
          break;
        case "Tokens - Heroes2":
          this.fetchHeroList(100, "2");
          break;
        case "Tokens - Heroes3":
          this.fetchHeroList(200, "3");
          break;
        default:
          this.fetchSavedList();
          break;
      }
    },
  },
  data() {
    return {
      tokenList: tokenList,
      items: [
        "Tokens - Saved",
        "Tokens - Monsters",
        "Tokens - Heroes1",
        "Tokens - Heroes2",
        "Tokens - Heroes3",
      ],
      listSelected: "Tokens - Saved",
      tokens: [],
      tokenCache: {},
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
    fetchSavedList() {
      this.tokens = [];
    },
    fetchMonsterList() {
      if (this.tokenCache.monsters) {
        this.tokens = this.tokenCache.monsters;
      } else {
        this.tokens = this.tokenList.slice(0, 100);
        this.tokenCache.monsters = this.tokens;
      }
    },
    fetchHeroList(startPoint, num) {
      if (this.tokenCache.heroes && this.tokenCache.heroes[num]) {
        this.tokens = this.tokenCache.heroes[num];
      } else {
        this.tokens = [];
        let sizeLimit = 100;
        this.storageRef = firebase.storage().ref("tokens");
        console.log(this.storageRef);
        this.storageRef
          .listAll()
          .then((res) => {
            for (let i = startPoint; i < sizeLimit + startPoint; i++) {
              let item = res.items[i];
              item.getDownloadURL().then((url) => {
                this.tokens.push(url);
              });
            }
          })
          .then(() => {
            this.tokenCache.heroes[num] = this.tokens;
          })
          .catch((error) => {
            // Uh-oh, an error occurred!
            console.error(error);
          });
      }
    },
    onDragStart(url) {
      this.tokenAdded.url = url;
      // console.log(token);
    },
    onDragEnd(e) {
      console.log(e, e.originalEvent);
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
};
</script>
<style>
.max {
  width: 100vw;
  height: 100vh;
}
</style>
