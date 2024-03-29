<template>
  <div style="height: 100%">
    <v-card
      rounded
      disabled
      tile
      elevation="10"
      v-if="stage && false"
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
      <v-expansion-panels focusable accordion flat multiple small>
        <v-expansion-panel>
          <v-expansion-panel-header @click="selectionToggle = !selectionToggle"
            >Selection</v-expansion-panel-header
          >
          <v-expansion-panel-content v-show="showSelected">
            <div v-show="selected">
              <v-container
                v-if="!selected.marker"
                class="text-center token-img"
              >
                <v-img
                  :src="selected.src ? selected.src : selected.url"
                  max-width="140"
                  class="mx-auto justify-center"
                ></v-img
              ></v-container>
              <div v-else :class="selected.fill">
                <v-icon x-large>mdi-map-marker</v-icon>
                MARKER
              </div>
              <div>
                <span class="overline mx-3 yellow--text">Name: </span>
                <span class="caption">{{ selected.name }}</span>
              </div>
              <div>
                <span v-show="selected.notes" class="overline mx-3 yellow--text"
                  >Notes:
                </span>
                <span class="caption">{{ selected.notes }}</span>
              </div>
            </div>
            <div class="caption" v-if="!selected">No Selection</div>
            <v-divider></v-divider>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>Objects</v-expansion-panel-header>
          <v-btn
            text
            x-small
            class="my-0 mx-auto sort-objects"
            @click="sortTokenList"
            >Sort Objects</v-btn
          >
          <v-expansion-panel-content>
            <div v-for="token in sortableList" :key="token.__id">
              <v-row
                no-gutters
                v-if="isOwner || (token.visible && !token.sendToBack)"
                ><v-col :cols="isOwner ? 9 : 12"
                  ><v-card
                    class="mt-1 mx-0"
                    flat
                    tile
                    :color="getColor(token.tokenGroup)"
                    @click="tokenMenuClick(token, $event)"
                    @click.middle="tokenMenuClick(token, $event)"
                  >
                    <v-card-text class="pa-1">
                      <v-avatar size="25" class="mr-1">
                        <v-img :src="token.url"></v-img
                      ></v-avatar>
                      <span class="pa-1 text-center text-subtitle">
                        {{ token.name ? token.name : "unnamed" }}
                      </span>
                    </v-card-text>
                  </v-card></v-col
                >
                <v-col v-if="isOwner" cols="1"
                  ><v-btn
                    x-small
                    icon
                    :color="
                      token.visible
                        ? token.tokenGroup
                          ? getColor(token.tokenGroup).replace(
                              'darken',
                              'lighten'
                            )
                          : 'white'
                        : 'grey darken-3'
                    "
                    class="ma-1 my-2"
                    @click="visibleSwitch(token)"
                    ><v-icon small>mdi-eye</v-icon></v-btn
                  ></v-col
                >
                <v-col v-if="isOwner" cols="1">
                  <v-btn
                    icon
                    x-small
                    :color="
                      token.tokenGroup
                        ? getColor(token.tokenGroup).replace(
                            'darken',
                            'lighten'
                          )
                        : 'white'
                    "
                    @click="(selected = token), (editTokenDialog = true)"
                    class="ma-1 ml-3 my-2"
                    ><v-icon small>mdi-cog</v-icon></v-btn
                  >
                </v-col>
              </v-row>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel v-if="isOwner">
          <v-expansion-panel-header>Backgrounds</v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="mt-2"></div>
            <div v-for="background in backgrounds" :key="background.__id">
              <BackgroundList
                :background="background"
                :isActive="background.__id == activeBackground.__id"
              />
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>Handouts</v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="mt-2"></div>
            <HandoutList />
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel v-if="isOwner">
          <v-expansion-panel-header>Controls</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-container>
              <v-btn class="ma-1" @click="showTokenBrowser = true"
                >Token Browser</v-btn
              >
              <v-btn class="ma-1" @click="setViewpoint">Set Viewport</v-btn>
              <v-btn class="ma-1" @click="setFog">{{
                effects ? (effects.fog ? "Fog Off" : "Fog On") : "Fog On"
              }}</v-btn>
              <v-btn class="ma-1" @click="setActive">{{
                sessionActive !== null
                  ? sessionActive
                    ? "Session Active"
                    : "Session Inactive"
                  : "Session Active"
              }}</v-btn>
              <v-select
                v-if="activeUsers.length && !sessionActive"
                v-model="allowedUsers"
                :items="Array.from(activeUsers, (x) => x['displayName'])"
                attach
                chips
                label="Allowed Users"
                multiple
              ></v-select>
            </v-container>
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
            <v-text-field v-model="tokenName" label="Name"></v-text-field>

            <v-text-field
              v-if="!(selected.marker || selected.type === 'path')"
              label="Race"
              v-model="selected.race"
            ></v-text-field>
            <v-textarea label="Notes" v-model="selected.notes"></v-textarea>
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
            <v-checkbox
              label="Apply to all color group items"
              v-model="applyToGroup"
            ></v-checkbox>
            <v-checkbox
              label="Send To Back"
              v-model="selected.sendToBack"
            ></v-checkbox>
            <v-select
              v-model="gcoSelect"
              v-if="selected.type === 'path' || 1"
              :hint="gcoSelect.description"
              :items="gcoItems"
              item-text="value"
              item-value="value"
              label="global Composite Operation"
              persistent-hint
              return-object
              single-line
            ></v-select>
            <div class="pt-10"> {{ selected.src ? selected.src : selected.url }}</div>
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
import { orderBy } from "lodash";
import TokenBrowser from "@/components/TokenBrowser";
import BackgroundList from "@/components/BackgroundList";
import HandoutList from "@/components/HandoutList";
export default {
  name: "SidePanel",
  watch: {
    gcoSelect(val) {
      this.selected.globalCompositeOperation = val.value;
    },
    objectsActive(val) {
      console.log(val);
    },
    selected(val) {
      this.tokenName = val.name;
    },
    activeBackground(val) {
      this.sortableList = null;
      this.detachListeners();
      this.attachListeners(val);
    },
    tokenList(list) {
      if (!this.sortableList) {
        this.sortableList = list;
        this.sortTokenList();
      } else {
        list.forEach((i) => {
          let found = false;
          this.sortableList.forEach((j) => {
            if (i.__id === j.__id) {
              Object.keys(i).forEach((key) => {
                j[key] = i[key];
              });
              j.visible = i.visible;
              found = true;
            }
          });
          if (!found) this.sortableList.push(i);
        });
        this.sortableList.forEach((j) => {
          let found = false;
          list.forEach((i) => {
            if (i.__id === j.__id) {
              found = true;
            }
          });
          if (!found) {
            let index = this.sortableList.indexOf(j);
            this.sortableList.splice(index, 1);
          }
        });
      }
    },
    allowedUsers(users) {
      if (!users || users.length == 0) {
        this.setAllowedUsers([]);
      } else {
        this.setAllowedUsers(users);
      }
    },
  },
  components: {
    TokenBrowser,
    BackgroundList,
    HandoutList,
  },
  data() {
    return {
      effects: null,
      effectsRef: null,
      applyToGroup: false,
      objectsActive: false,
      tokenName: "",
      sortableList: null,
      sessionActive: false,
      showTokenBrowser: false,
      selectionToggle: false,
      session: {},
      allowedUsers: [],
      sessionRef: null,
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
    bgMenu: {
      get() {
        return this.$store.getters.bgMenu;
      },
      set(value) {
        return this.$store.dispatch("setBgMenu", value);
      },
    },
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
      isOwner: "isStageOwner",
      activeUsers: "activeUsers",
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
    setFog() {
      let isFog = this.effects
        ? this.effects.fog !== null
          ? this.effects.fog
          : false
        : false;
      this.effectsRef.set({ fog: !isFog });
    },
    setAllowedUsers(users) {
      if (!this.sessionRef) this.attachListeners(this.activeBackground);
      let uidArray = [];
      users.forEach((user) => {
        const index = this.activeUsers
          .map((object) => object.displayName)
          .indexOf(user);
        uidArray.push(this.activeUsers[index].uid);
      });

      this.sessionRef.child("allowedUsers").set(uidArray);
      console.log(users);
    },
    setActive() {
      if (!this.sessionRef) this.attachListeners(this.activeBackground);
      let active = this.sessionActive ? true : false;
      this.sessionRef.child("active").set(!active);
    },
    sortTokenList() {
      this.sortableList = orderBy(
        this.tokenList,
        ["tokenGroup", "sendToBack", "name"],
        ["desc", "desc", "asc"]
      );
    },
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

      if (!thisToken.tokenGroup) {
        const token = tokenRef.child(thisToken.__id);
        token.update({ visible: !thisToken.visible });
        console.log(1);
      } else {
        this.sortableList.forEach((tkn) => {
          if (tkn.tokenGroup && tkn.tokenGroup === thisToken.tokenGroup) {
            console.log(3);
            const token = tokenRef.child(tkn.__id);
            token.update({ visible: !thisToken.visible });
          }
        });
      }
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
        if (!this.selected.tokenGroup || !this.applyToGroup) {
          const token = tokenRef.child(this.selected.__id);
          const update = {
            name: this.tokenName,
            race: this.selected.race,
            notes: this.selected.notes,
            evented: this.selected.evented,
            deletable: this.selected.deletable,
            visible: this.selected.visible,
            selectable: this.selected.selectable,
            globalCompositeOperation: this.selected.globalCompositeOperation,
            sendToBack: this.selected.sendToBack
              ? this.selected.sendToBack
              : false,
          };
          token.update(update);
        } else {
          this.sortableList.forEach((tkn) => {
            if (tkn.tokenGroup && tkn.tokenGroup === this.selected.tokenGroup) {
              console.log(3);
              const token = tokenRef.child(tkn.__id);
              const update = {
                name: this.tokenName,
                race: this.selected.race,
                notes: this.selected.notes,
                evented: this.selected.evented,
                deletable: this.selected.deletable,
                visible: this.selected.visible,
                selectable: this.selected.selectable,
                sendToBack: this.selected.sendToBack
                  ? this.selected.sendToBack
                  : false,
              };
              token.update(update);
            }
          });
        }
        const token = tokenRef.child(this.selected.__id);
        const update = {
          name: this.tokenName,
          race: this.selected.race,
          notes: this.selected.notes,
          evented: this.selected.evented,
          deletable: this.selected.deletable,
          visible: this.selected.visible,
          selectable: this.selected.selectable,
          sendToBack: this.selected.sendToBack
            ? this.selected.sendToBack
            : false,
        };
        token.update(update);
      }
      this.editTokenDialog = false;
      this.applyToGroup = false;
    },
    getColor(group) {
      if (!group) {
        return "#171717";
      }
      switch (group) {
        case 1:
          return "red darken-3";
        case 2:
          return "blue darken-3";
        case 3:
          return "orange darken-3";
        case 4:
          return "green darken-3";
        case 5:
          return "pink darken-3";
        case 6:
          return "black";
        case 7:
          return "yellow darken-3";
        case 8:
          return "teal darken-3";
        case 9:
          return "brown darken-3";
        default:
          return "#171717";
      }
    },
    tokenMenuClick(token, e) {
      this.selected = token;
      if (this.isOwner) {
        if (e.altKey) return;
        if (e.ctrlKey || e.button === 1) {
          token.tokenGroup = 0;
        } else if (!token.tokenGroup && token.tokenGroup !== 0) {
          token.tokenGroup = 1;
        } else {
          token.tokenGroup++;
          if (token.tokenGroup > 9) {
            token.tokenGroup = 0;
          }
        }

        const slug = `users/${this.stage.owner}/stages/${this.stage.slug}`;
        const bgSlug = slug + "/backgrounds/" + this.activeBackground.__id;
        const tokenRef = db.database().ref(bgSlug + "/tokens");
        const tokenUpdate = tokenRef.child(this.selected.__id);
        tokenUpdate.update({
          tokenGroup: token.tokenGroup,
        });
      }
    },
    detachListeners() {
      if (this.effectsRef !== null) this.effectsRef.off();
      return true;
    },
    attachListeners(activeBackground) {
      if (this.sessionRef) this.sessionRef.off();
      if (this.bgRef) this.bgRef.off();
      if (!activeBackground.__id) return;
      const slug = `users/${this.stage.owner}/stages/${this.stage.slug}`;
      const bgSlug = slug + "/backgrounds/" + activeBackground.__id;

      this.sessionRef = db.database().ref(slug + "/session");
      this.effectsRef = db.database().ref(bgSlug + "/efects");

      this.sessionRef.child("active").on("value", (snapshot) => {
        this.sessionActive = snapshot.val();
        console.log("SESSION THING", this.session);
      });

      this.effectsRef.on("value", (snapshot) => {
        this.effects = snapshot.val();
      });
    },
  },
  mounted() {},
};
</script>

<style>
html {
  overflow-y: auto;
}
.v-expansion-panel-content__wrap {
  padding: 0 !important;
}
.v-expansion-panel-content {
  padding: 0 !important;
  max-height: 40vh;
  overflow-y: auto;
}
.sort-objects {
  display: none;
}

.v-expansion-panel--active > .sort-objects {
  display: grid;
  margin: auto;
}
.token-img {
  display: flex;
  height: 164px;
  align-items: center;
}
</style>
