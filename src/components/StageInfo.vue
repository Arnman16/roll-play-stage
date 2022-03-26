<template>
  <div style="height: 100%">
    <v-card
      rounded
      disabled
      tile
      elevation="10"
      v-if="stage"
      color="blue-grey darken-4"
      class="ma-1"
    >
      <v-card-title class="mx-auto pa-2">
        <h4 class="mx-auto">
          {{ stage.pageName }}
        </h4>
      </v-card-title>
    </v-card>
    <v-container fill-height class="px-1 pb-1 pt-0 align-start">
      <v-expansion-panels focusable accordion multiple>
        <v-expansion-panel>
          <v-expansion-panel-header @click="selectionToggle = !selectionToggle"
            >Selection</v-expansion-panel-header
          >
          <v-expansion-panel-content v-show="showSelected">
            <div v-show="selected">
              <v-img
                v-if="!selected.marker"
                :src="selected.src ? selected.src : selected.url"
              ></v-img>
              <div v-else :class="selected.fill">
                <v-icon x-large>mdi-map-marker</v-icon>
                MARKER
              </div>
              <div>
                <span class="overline">Name: </span>
                <span class="caption">{{ selected.name }}</span>
              </div>
              <div v-if="!(selected.marker || selected.type === 'path')">
                <span class="overline">Race: </span>
                <span class="caption">{{ selected.race }}</span>
              </div>
              <div>
                <v-divider></v-divider>
                <span class="overline">Notes: </span>
                <span class="caption">{{ selected.notes }}</span>
              </div>
              <v-btn @click="editTokenDialog = true" icon dark color="yellow">
                <v-icon>mdi-playlist-edit</v-icon>
              </v-btn>
            </div>
            <div class="caption" v-if="!selected">No Selection</div>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>Objects</v-expansion-panel-header>
          <v-expansion-panel-content>
            <div v-for="token in tokenList" :key="token.__id">
              <v-row no-gutters
                ><v-col
                  ><v-card
                    class="my-1 mx-0"
                    tile
                    color="black"
                    @click="selected = token"
                  >
                    <v-card-text class="pa-1 text-center">
                      {{ token.name ? token.name : "unnamed" }}
                    </v-card-text>
                  </v-card></v-col
                >
                <v-col cols="2"
                  ><v-btn
                    small
                    icon
                    :color="token.visible ? 'white' : 'grey darken-3'"
                    class="my-1 mr-0 ml-2"
                    @click="visibleSwitch(token)"
                    ><v-icon>mdi-eye</v-icon></v-btn
                  ></v-col
                >
              </v-row>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>Backgrounds</v-expansion-panel-header>
          <v-expansion-panel-content>
            <div v-for="background in backgrounds" :key="background.__id">
              <v-card
                class="my-2 mx-0"
                tile
                :color="
                  background.__id == activeBackground.__id
                    ? 'light-blue darken-4'
                    : 'light-blue'
                "
                @click="setActiveBg(background)"
              >
                <v-card-text class="pa-1 text-center">
                  {{ background.name }}
                </v-card-text>
              </v-card>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-btn @click="showTokenBrowser = true">test</v-btn>
      <v-btn @click="setViewpoint">vpt</v-btn>
    </v-container>
    <v-dialog v-model="editTokenDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Edit Token</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-text-field
              v-model="selected.name"
              label="Name"
              v-on:keyup.enter="saveToken"
            ></v-text-field>

            <v-text-field
              v-if="!(selected.marker || selected.type === 'path')"
              label="Race"
              v-model="selected.race"
              v-on:keyup.enter="saveToken"
            ></v-text-field>
            <v-textarea
              label="Notes"
              v-model="selected.notes"
              v-on:keyup.enter="saveToken"
            ></v-textarea>
            <v-checkbox
              label="Deletable"
              v-model="selected.deletable"
            ></v-checkbox>
            <v-checkbox
              label="Selectable"
              v-model="selected.selectable"
            ></v-checkbox>
            <v-checkbox label="Evented" v-model="selected.evented"></v-checkbox>
            <v-checkbox label="Visible" v-model="selected.visible"></v-checkbox>
            <v-select
              v-model="gcoSelect"
              v-if="selected.type === 'path'"
              :hint="gcoSelect.description"
              :items="gcoItems"
              item-text="value"
              item-value="value"
              label="global Composite Operation"
              persistent-hint
              return-object
              single-line
            ></v-select>
          </v-container>
          <!-- <small>*indicates required field</small> -->
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="editTokenDialog = false">
            Close
          </v-btn>
          <v-btn color="blue darken-1" text @click="saveToken"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <TokenBrowser v-model="showTokenBrowser" />
  </div>
</template>
<script>
import { db, firebase } from "../db";
import { mapGetters } from "vuex";
import TokenBrowser from "@/components/TokenBrowser";
export default {
  name: "SidePanel",
  watch: {
    gcoSelect(val) {
      this.selected.globalCompositeOperation = val.value;
    },
  },
  components: {
    TokenBrowser,
  },
  data() {
    return {
      showTokenBrowser: false,
      selectionToggle: false,
      gcoSelect: {
        value: "source-over",
        description:
          "Default. Displays the source image over the destination image",
      },
      gcoItems: [
        {
          value: "source-over",
          description:
            "Default. Displays the source image over the destination image",
        },
        {
          value: "destination-in",
          description:
            "Displays the destination image in to the source image. Only the part of the destination image that is INSIDE the source image is shown, and the source image is transparent",
        },
        {
          value: "destination-out",
          description:
            "Displays the destination image out of the source image. Only the part of the destination image that is OUTSIDE the source image is shown, and the source image is transparent",
        },
      ],
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
    ...mapGetters({
      stage: "stage",
    }),
    slug() {
      return this.$route.params.slug;
    },
    selected: {
      get() {
        return this.$store.getters.selected;
      },
      set(newSelection) {
        return this.$store.dispatch("setSelected", newSelection);
      },
    },
    editTokenDialog: {
      get() {
        return this.$store.getters.editTokenDialog;
      },
      set(val) {
        return this.$store.dispatch("setEditTokenDialog", val);
      },
    },
    backgrounds: {
      get() {
        return this.$store.getters.backgrounds;
      },
      set(newBackgrounds) {
        return this.$store.dispatch("setBackgrounds", newBackgrounds);
      },
    },
    activeBackground: {
      get() {
        return this.$store.getters.activeBackground;
      },
      set(newActiveBackground) {
        return this.$store.dispatch("setActiveBackground", newActiveBackground);
      },
    },
    tokenList: {
      get() {
        return this.$store.getters.tokens;
      },
      set(newTokens) {
        return this.$store.dispatch("setTokens", newTokens);
      },
    },
    showSelected() {
      return this.selected && this.selectionToggle;
    },
  },
  methods: {
    setViewpoint() {
      const slug = `users/${this.stage.owner}/stages/${this.stage.slug}`;
      const controlRef = db.database().ref(slug.concat("/control"));
      const msg = this.$store.getters.viewport;
      console.log(msg);
      controlRef.push({
        timeStamp: firebase.database.ServerValue.TIMESTAMP,
        type: "vpt",
        msg: msg,
      });
    },
    visibleSwitch(thisToken) {
      const slug = `users/${this.stage.owner}/stages/${this.stage.slug}`;
      const bgSlug = slug + "/backgrounds/" + this.activeBackground.__id;
      const tokenRef = db.database().ref(bgSlug + "/tokens");
      const token = tokenRef.child(thisToken.__id);
      const update = {
        visible: !thisToken.visible,
      };
      token.update(update);
    },
    saveToken() {
      const slug = `users/${this.stage.owner}/stages/${this.stage.slug}`;
      const bgSlug = slug + "/backgrounds/" + this.activeBackground.__id;
      if (this.selected.type === "path") {
        const drawingRef = db.database().ref(bgSlug + "/drawings");
        const drawing = drawingRef.child(this.selected.__id);
        drawing.update(this.selected);
      } else if (this.selected.marker === true) {
        const markerRef = db.database().ref(bgSlug + "/markers");
        const marker = markerRef.child(this.selected.__id);
        marker.update(this.selected);
      } else {
        const tokenRef = db.database().ref(bgSlug + "/tokens");
        const token = tokenRef.child(this.selected.__id);
        const update = {
          name: this.selected.name,
          race: this.selected.race,
          notes: this.selected.notes,
          evented: this.selected.evented,
          deletable: this.selected.deletable,
          visible: this.selected.visible,
          selectable: this.selected.selectable,
        };
        token.update(update);
      }
      this.editTokenDialog = false;
    },
    setActiveBg(background) {
      const slug = `users/${this.stage.owner}/stages/${this.stage.slug}`;
      // const bgSlug = slug + "/backgrounds/" + this.activeBackground.__id;
      this.sessionRef = db.database().ref(slug + "/session");
      this.sessionRef.child(1).update({
        activeBackground: background,
      });
      this.activeBackground = background;
    },
  },
};
</script>

<style>
html {
  overflow-y: auto;
}
</style>
