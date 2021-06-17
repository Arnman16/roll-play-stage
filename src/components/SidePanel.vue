<template>
  <div>
    <v-container class="pa-1">
      <v-expansion-panels focusable accordion multiple>
        <v-expansion-panel>
          <v-expansion-panel-header @click="selectionToggle = !selectionToggle"
            >Selection</v-expansion-panel-header
          >
          <v-expansion-panel-content v-show="showSelected">
            <div v-show="selected">
              <v-img v-if="!selected.marker" :src="selected.src"></v-img>
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
          <v-expansion-panel-content> </v-expansion-panel-content>
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
          <v-select
          v-model="gcoSelect"
          v-if="selected.type==='path'"
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
  </div>
</template>
<script>
import db from "../db";
export default {
  name: "SidePanel",
  watch: {
    gcoSelect(val) {
      this.selected.globalCompositeOperation = val.value;
    }
  },
  data() {
    return {
      selectionToggle: false,
      editTokenDialog: false,
      gcoSelect: { value: 'source-over', description: 'Default. Displays the source image over the destination image' },
        gcoItems: [
          { value: 'source-over', description: 'Default. Displays the source image over the destination image' },
          { value: 'destination-in', description: 'Displays the destination image in to the source image. Only the part of the destination image that is INSIDE the source image is shown, and the source image is transparent' },
          { value: 'destination-out', description: 'Displays the destination image out of the source image. Only the part of the destination image that is OUTSIDE the source image is shown, and the source image is transparent' },
        ],
    };
  },
  computed: {
    selected: {
      get() {
        return this.$store.state.selected;
      },
      set(newSelection) {
        return this.$store.dispatch("setSelected", newSelection);
      },
    },
    backgrounds: {
      get() {
        return this.$store.state.backgrounds;
      },
      set(newBackgrounds) {
        return this.$store.dispatch("setBackgrounds", newBackgrounds);
      },
    },
    activeBackground: {
      get() {
        return this.$store.state.activeBackground;
      },
      set(newActiveBackground) {
        return this.$store.dispatch("setActiveBackground", newActiveBackground);
      },
    },
    showSelected() {
      return this.selected && this.selectionToggle;
    },
  },
  methods: {
    saveToken() {
      if (this.selected.type === "path") {
        const drawingRef = db.database().ref("drawings");
        const drawing = drawingRef.child(this.selected.__id);
        drawing.update(this.selected);
      } else if (this.selected.marker === true) {
        const markerRef = db.database().ref("markers");
        const marker = markerRef.child(this.selected.__id);
        marker.update(this.selected);
      } else {
        const tokenRef = db.database().ref("tokens");
        const token = tokenRef.child(this.selected.__id);
        token.update(this.selected);
      }
      this.editTokenDialog = false;
    },
    setActiveBg(background) {
      let sessionRef = db.database().ref("session");
      sessionRef.child(1).update({
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
