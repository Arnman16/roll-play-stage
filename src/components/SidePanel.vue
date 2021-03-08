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
              <v-img :src="selected.src"></v-img>
              <div>
                <span class="overline">Name: </span>
                <span class="caption">{{ selected.name }}</span>
              </div>
              <div>
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
          <v-expansion-panel-header>OBJECTS</v-expansion-panel-header>
          <v-expansion-panel-content> </v-expansion-panel-content>
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
              <v-text-field v-model="selected.name" label="Name" required></v-text-field>

              <v-text-field
                label="Race"
                v-model="selected.race"
              ></v-text-field>
              <v-textarea
                label="Notes"
                v-model="selected.notes"
              ></v-textarea>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="editTokenDialog = false">
            Close
          </v-btn>
          <v-btn color="blue darken-1" text @click="saveToken">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import db from "../db";
export default {
  name: "SidePanel",
  data() {
    return {
      selectionToggle: false,
      editTokenDialog: false,
      images: [
        {
          name: "Donald Trump",
          url: "http://i.imgur.com/QcJru0b.png",
        },
        {
          name: "Hilary Clinton",
          url: "http://i.imgur.com/Yp9zAaY.png",
        },
        {
          name: "Bernie Sanders",
          url: "http://i.imgur.com/K4ZroX1.png",
        },
        {
          name: "Barack Obama",
          url: "http://i.imgur.com/j7zfXYB.png",
        },
        {
          name: "Joe Biden",
          url: "http://i.imgur.com/ZACKyqE.png",
        },
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
    showSelected() {
      return this.selected && this.selectionToggle;
    },
  },
  methods: {
    saveToken() {
      const tokenRef = db.database().ref("tokens");
      const token = tokenRef.child(this.selected.__id);
      token.update(this.selected)
      this.editTokenDialog = false;
    }
  },
};
</script>

<style>
html {
  overflow-y: auto;
}
</style>