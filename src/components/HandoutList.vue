<template>
  <div class="ma-0 pa-0">
    <v-btn
      text
      small
      class="my-0 mx-auto add-handout"
      v-if="isOwner"
      @click="(addHandoutDialog = true), (name = ''), (url = '')"
      >Add Handout</v-btn
    >
    <div class="ma-0 pa-0" v-for="(handout, key) in handouts" :key="key">
      <v-dialog v-model="showMenu[key]" max-width="500px">
        <template v-slot:activator="{ on, attrs }">
          <v-row no-gutters v-show="isOwner || handout.visible"
            ><v-col :cols="isOwner ? 9 : 12"
              ><v-card
                class="mt-1 mx-0"
                flat
                tile
                color="#171717"
                @click="sendHandout(handout)"
              >
                <span class="pa-1 text-center text-subtitle">
                  {{ handout.name }}
                </span>
              </v-card>
            </v-col>
            <v-col v-if="isOwner" cols="1">
              <v-btn
                icon
                x-small
                v-bind="attrs"
                v-on="on"
                @click="(name = handout.name), (url = handout.url)"
                class="ma-1 my-2"
                ><v-icon small>mdi-cog</v-icon></v-btn
              >
            </v-col>
            <v-col v-if="isOwner" cols="1"
              ><v-btn
                x-small
                icon
                :color="handout.visible ? 'white' : 'grey darken-3'"
                class="ma-1 ml-3 my-2"
                @click="visibleSwitch(handout, key)"
                ><v-icon small>mdi-eye</v-icon></v-btn
              ></v-col
            >
          </v-row>
        </template>
        <v-card>
          <v-toolbar dense flat>
            <!-- <v-spacer></v-spacer> -->
            <v-toolbar-title class="mx-auto">
              Edit Handout - {{ handout.name }}
            </v-toolbar-title>

            <!-- <v-spacer></v-spacer> -->
            <v-btn icon @click="showMenu[key] = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-list>
            <v-list-item>
              <v-list-item-content>
                <v-text-field
                  clearable
                  label="Name"
                  :value="handout.name"
                  v-model="name"
                ></v-text-field>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-text-field
                  clearable
                  label="Url"
                  :value="handout.url"
                  v-model="url"
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
              <v-list-item-title>Persistent</v-list-item-title>
            </v-list-item>
          </v-list>

          <v-card-actions>
            <v-btn warn @click="deleteDialog = true">Delete</v-btn>
            <v-spacer></v-spacer>

            <v-btn text @click="showMenu[key] = false">
              Cancel
            </v-btn>
            <v-btn color="primary" text @click="saveHandout(key)">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="deleteDialog" persistent max-width="290">
        <v-card>
          <v-card-title class="text-h5">
            Delete {{ handout.name }}
          </v-card-title>
          <v-card-text>
            Are you sure you want to delete this Handout? <br /><br />This
            action cannot be undone.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="deleteDialog = false">
              No
            </v-btn>
            <v-btn color="green darken-1" text @click="deleteHandout(key)">
              Yes, Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <v-dialog v-model="addHandoutDialog" max-width="500px" persistent>
      <v-card>
        <v-toolbar dense flat>
          <!-- <v-spacer></v-spacer> -->
          <v-toolbar-title class="mx-auto">
            Add Handout
          </v-toolbar-title>

          <!-- <v-spacer></v-spacer> -->
          <v-btn icon @click="addHandoutDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-text-field
                clearable
                label="Name"
                value=""
                v-model="name"
              ></v-text-field>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-text-field
                clearable
                label="URL"
                value=""
                v-model="url"
              ></v-text-field>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn text @click="addHandoutDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" text @click="addHandout()">
            ADD
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { db, firebase } from "../db";
export default {
  name: "HandoutList",
  computed: {
    stage() {
      return this.$store.getters.stage;
    },
    isOwner() {
      return this.$store.getters.isStageOwner;
    },
  },
  watch: {},
  data: () => ({
    deleteDialog: false,
    name: "",
    url: "",
    showMenu: {},
    fav: true,
    message: false,
    hints: true,
    handoutRef: null,
    handouts: {},
    addHandoutDialog: false,
  }),
  methods: {
    visibleSwitch(handout, key) {
      const thisHandout = this.handoutRef.child(key);
      thisHandout.update({ visible: !handout.visible });
    },
    addHandout() {
      this.handoutRef.push({
        name: this.name,
        url: this.url,
        visible: false,
      });
      this.name = "";
      this.url = "";
      this.addHandoutDialog = false;
    },
    sendHandout(handout) {
      const slug = `users/${this.stage.owner}/stages/${this.stage.slug}`;
      const controlRef = db.database().ref(slug.concat("/control"));
      controlRef.push({
        timeStamp: firebase.database.ServerValue.TIMESTAMP,
        type: "handout",
        msg: handout,
      });
    },
    saveHandout(key) {
      console.log(key);
      const thisHandout = this.handoutRef.child(key);
      thisHandout.update({ name: this.name, url: this.url });
      this.showMenu[key] = false;
    },
    deleteHandout(key) {
      const thisHandout = this.handoutRef.child(key);
      console.log("BG removed");
      thisHandout.remove().catch((error) => {
        console.log("BG delete: ", error.message);
      });
      this.deleteDialog = false;
      this.showMenu[key] = false;
    },
    setWatchers() {
      if (this.handoutRef) this.handoutRef.off();
      const slug = `users/${this.stage.owner}/stages/${this.stage.slug}`;
      this.handoutRef = db.database().ref(slug + "/handouts");

      this.handoutRef.on("value", (snapshot) => {
        this.handouts = snapshot.val();
      });
      // this.handoutRef.on("child_changed", (snapshot) => {
      //   this.handouts[snapshot.key] = snapshot.val();
      // });
    },
  },
  mounted() {
    this.setWatchers();
  },
};
</script>

<style lang="css">
.add-handout {
  display: none;
}

.v-expansion-panel--active
  > .v-expansion-panel-content
  > .v-expansion-panel-content__wrap
  > .ma-0
  > .add-handout {
  display: grid;
  margin: auto;
}
</style>
