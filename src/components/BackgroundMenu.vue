<template>
  <div class="ma-0 pa-0">
    <v-dialog v-model="showMenu" max-width="500px">
      <template v-slot:activator="{ on, attrs }">
        <v-row no-gutters
          ><v-col cols="10"
            ><v-card
              class="mt-1 mx-0 pa-1"
              flat
              tile
              :light="isActive"
              :color="isActive ? 'white' : '#171717'"
              @click="setActiveBg(background)"
            >
              <v-card-text class="pt-0 py-1 pb-1 text-center text-subtitle">
                {{ background.name }}
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="1">
            <v-btn
              icon
              x-small
              v-bind="attrs"
              v-on="on"
              @click="name = background.name"
              class="ma-1 my-2"
              ><v-icon small>mdi-cog</v-icon></v-btn
            >
          </v-col>
        </v-row>
      </template>
      <v-card>
        <v-toolbar dense flat>
          <!-- <v-spacer></v-spacer> -->
          <v-toolbar-title class="mx-auto">
            Edit Background - {{ background.name }}
          </v-toolbar-title>

          <!-- <v-spacer></v-spacer> -->
          <v-btn icon @click="showMenu = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-text-field
                clearable
                label="Name"
                :value="background.name"
                v-model="name"
              ></v-text-field>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list>
          <v-list-item>
            <v-list-item-action>
              <v-switch v-model="message" color="purple"></v-switch>
            </v-list-item-action>
            <v-list-item-title>Enable messages</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-action>
              <v-switch v-model="hints" color="purple"></v-switch>
            </v-list-item-action>
            <v-list-item-title>Enable hints</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-card-actions>
          <v-btn @click="setActiveBg(background)">Set as Current</v-btn>
          <v-btn warn @click="deleteDialog = true">Delete</v-btn>
          <v-spacer></v-spacer>

          <v-btn text @click="showMenu = false">
            Cancel
          </v-btn>
          <v-btn color="primary" text @click="saveBg(background)">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="deleteDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="text-h5">
          Delete {{ background.name }}
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete this background? <br /><br />This
          action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="deleteDialog = false">
            No
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            @click="deleteBackground(background)"
          >
            Yes, Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { auth, db } from "../db";
export default {
  props: {
    background: Object,
    isActive: Boolean,
  },
  computed: {
    stage() {
      return this.$store.getters.stage;
    },
    activeBackground: {
      get() {
        return this.$store.getters.activeBackground;
      },
      set(newActiveBackground) {
        return this.$store.dispatch("setActiveBackground", newActiveBackground);
      },
    },
  },
  watch: {},
  data: () => ({
    deleteDialog: false,
    name: "",
    showMenu: false,
    fav: true,
    message: false,
    hints: true,
  }),
  methods: {
    setActiveBg(bg) {
      this.bgMenu = true;
      const slug = `users/${auth.currentUser.uid}/stages/${bg.stage}/session`;
      this.sessionRef = db.database().ref(slug);
      this.sessionRef.child(1).update({
        activeBackground: bg,
      });
      this.activeBackground = bg;
      this.showMenu = false;
    },
    saveBg(bg) {
      const slug = `users/${auth.currentUser.uid}/stages/${bg.stage}/backgrounds/${bg.__id}`;
      const bgRef = db.database().ref(slug);
      bgRef.update({ name: this.name });
      this.showMenu = false;
    },
    deleteBackground(bg) {
      const slug = `users/${auth.currentUser.uid}/stages/${bg.stage}/backgrounds/${bg.__id}`;
      const bgRef = db.database().ref(slug);
      console.log("BG removed");
      bgRef.remove().catch((error) => {
        console.log("BG delete: ", error.message);
      });
      this.deleteDialog = false;
      this.showMenu = false;
    },
    setActive() {
      const slug = `users/${auth.currentUser.uid}/stages/${this.stage.slug}`;
      this.sessionRef = db.database().ref(slug + "/session");
    },
  },
  mounted() {},
};
</script>
