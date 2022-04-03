<template>
  <div>
    <v-container fluid class="pa-0">
      <div
        v-touchy:start="startHandler"
        v-touchy:end="endHandler"
        v-touchy:moving="movingHandler"
        v-touchy:tap="tapHandler"
        @drop.prevent="addTokenDrag"
        @dragover.prevent
        v-on:dblclick="resetZoom"
        class="fixed"
      >
        <FogEffect
          v-if="effects ? (effects.fog !== null ? effects.fog : false) : false"
        />
        <canvas ref="can"> </canvas>
        <div v-cloak @drop.prevent="bgDrag = true" @dragover.prevent>
          <v-card
            elevation="15"
            class="minimap"
            style="position: absolute; top: 10px; left: 10px"
          >
            <v-img
              :src="activeBackground.url"
              :width="minimap.width"
              :height="minimap.height"
            >
              <v-card
                color="rgba(255, 255, 255, 0.2)"
                flat
                :style="minimapSquare"
              ></v-card>
            </v-img>
            <!-- <canvas ref="mini" width="80" height="80"></canvas> -->
          </v-card>
        </div>
      </div>
    </v-container>
    <draggable @end="onPinDrop">
      <v-btn
        x-large
        icon
        plain
        :ripple="false"
        style="position: absolute; bottom: 80px; left: 15px; z-index: 2"
      >
        <v-img max-width="56" :src="locationPin"></v-img>
      </v-btn>
    </draggable>
    <v-speed-dial
      fab
      v-model="fab"
      bottom
      left
      direction="right"
      transition="slide-y-reverse-transition"
      style="position: absolute; bottom: 15px; left: 15px; z-index: 2"
    >
      <template v-slot:activator>
        <v-btn v-model="fab" :color="colorPickerColor" dark fab>
          <v-icon v-if="fab"> mdi-close </v-icon>
          <v-icon v-else> mdi-cog </v-icon>
        </v-btn>
      </template>
      <v-menu
        :value="showAddMenu"
        open-on-hover
        close-delay="200"
        top
        offset-y
        content-class="elevation-0"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            v-on="on"
            @click.capture.stop="showAddMenu = !showAddMenu"
            fab
            dark
            small
            color="indigo"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <v-list color="transparent">
          <v-list-item @click="1" flat class="pa-0">
            <v-list-item-action>
              <v-btn fab small color="blue">
                <v-icon>mdi-square</v-icon>
              </v-btn>
            </v-list-item-action>
            <v-list-item-title>Background</v-list-item-title>
          </v-list-item>
          <v-list-item @click="1" flat class="pa-0">
            <v-list-item-action>
              <v-btn fab small color="yellow darken-2">
                <v-icon>mdi-triangle</v-icon>
              </v-btn>
            </v-list-item-action>
            <v-list-item-title>Marker</v-list-item-title>
          </v-list-item>
          <v-list-item @click="1" flat class="pa-0">
            <v-list-item-action>
              <v-btn fab small color="red">
                <v-icon>mdi-circle</v-icon>
              </v-btn>
            </v-list-item-action>
            <v-list-item-title>Token</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        fab
        :color="colorPickerColor"
        small
        @click.capture.stop="colorPickerDialog = true"
      >
        <v-icon> mdi-palette</v-icon></v-btn
      >
      <v-menu
        open-on-hover
        top
        :value="showDice"
        offset-y
        close-delay="200"
        nudge-left="10"
        content-class="elevation-0"
        close-on-click
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            v-on="on"
            @click.capture.stop="showDice = !showDice"
            fab
            light
            small
            color="white"
          >
            <v-icon>mdi-dice-3-outline</v-icon>
          </v-btn>
        </template>
        <v-list color="transparent">
          <v-list-item
            v-for="(die, index) in dice"
            :key="index"
            flat
            class="pa-0"
          >
            <v-list-item-action class="ma-1">
              <v-btn
                @click.capture.stop="
                  rollDice(`1D${die.icon.total}`, die.icon.total)
                "
                fab
                :color="index % 2 === 0 ? 'red darken-4' : 'blue-grey darken-4'"
              >
                <v-icon large>{{ die.icon.text }}</v-icon>
              </v-btn>
            </v-list-item-action>
            <v-list-item-action class="ma-1">
              <v-btn
                @click.capture.stop="rollDice(die.two.text, die.two.total)"
                fab
                small
                :color="index % 2 === 0 ? 'red darken-4' : 'blue-grey darken-4'"
                >{{ die.two.text }}</v-btn
              >
            </v-list-item-action>
            <v-list-item-action class="ma-1">
              <v-btn
                @click.capture.stop="rollDice(die.three.text, die.three.total)"
                fab
                small
                :color="index % 2 === 0 ? 'red darken-4' : 'blue-grey darken-4'"
                >{{ die.three.text }}
              </v-btn>
            </v-list-item-action>
            <v-list-item-action class="ma-1">
              <v-btn
                @click.capture.stop="rollDice(die.four.text, die.four.total)"
                fab
                small
                :color="index % 2 === 0 ? 'red darken-4' : 'blue-grey darken-4'"
                >{{ die.four.text }}
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        fab
        dark
        small
        :style="drawMode ? 'opacity: 1;' : 'opacity: 0.3;'"
        color="yellow darken-4"
        @click.capture.stop="(drawMode = !drawMode), (isRulerTool = false)"
      >
        <v-icon>mdi-brush</v-icon>
      </v-btn>
      <v-btn
        fab
        dark
        small
        :style="isRulerTool ? 'opacity: 1;' : 'opacity: 0.3;'"
        color="purple"
        @click.capture.stop="(isRulerTool = !isRulerTool), (drawMode = false)"
        ><v-icon>mdi-ruler</v-icon></v-btn
      >
      <v-btn
        v-show="objectSelected"
        fab
        dark
        small
        color="red"
        @click.capture.stop="removeToken"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-speed-dial>
    <v-footer
      style="z-index: 1"
      height="34"
      color="rgba(0,0,0,0.8)"
      fixed
      padless
      outlined
      v-if="!isMobile"
    >
      <v-row class="py-0 mx-4">
        <v-col class="text-center text-caption pa-1 my-auto" cols="4"></v-col>
        <v-col
          class="text-center text-caption pa-1 my-auto"
          cols="3"
          v-if="!isMobile"
        >
          {{ new Date().getFullYear() }} — <strong>Roll Play Stage</strong>
        </v-col>
        <v-col
          class="text-center text-caption pa-1 font-weight-thin my-auto"
          style="border: 1px solid rgba(255, 255, 255, 0.2); opacity: 0.3"
          :cols="isMobile ? '5' : '3'"
        >
          bg: {{ this.activeBackground.name }} [{{
            this.activeBackground.width + ", " + this.activeBackground.height
          }}] : {{ this.zoom }}x
        </v-col>
        <v-col
          @click="testFunction"
          :cols="isMobile ? '3' : '2'"
          class="text-center text-caption pa-1 font-weight-thin my-auto"
          style="border: 1px solid rgba(255, 255, 255, 0.2); opacity: 0.3"
        >
          {{
            isMeasuring
              ? rulerLength.toFixed(1)
              : objectSelected
              ? distanceFromSelected.toFixed(1)
              : `${(mouse.x * mapScale).toFixed(1)}, ${(
                  mouse.y * mapScale
                ).toFixed(1)} (ft)`
          }}
        </v-col>
      </v-row>
    </v-footer>
    <v-dialog
      v-model="colorPickerDialog"
      max-width="500px"
      transition="dialog-transition"
    >
      <v-card class="mx-auto pa-1" color="grey darken-3">
        <v-toolbar dense flat>
          <v-toolbar-title small class="mx-auto">Paint Options</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="colorPickerDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-sheet class="pa-3">
          <v-color-picker
            dot-size="19"
            hide-inputs
            class="mx-auto pt-5"
            v-model="colorPickerColor"
          >
          </v-color-picker>
          <v-divider class="my-2"></v-divider>
          <div class="pa-5">
            <div class="text-caption text-center">Line Size</div>
            <v-slider
              min="1"
              max="100"
              color="colorPickerColor"
              thumb-color="grey darken-2"
              thumb-label
              hide-details
              class="mx-10"
              v-model="strokeWidth"
              hint="Line Size"
            ></v-slider>
          </div>
        </v-sheet>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="filterDialog"
      max-width="500px"
      transition="dialog-transition"
    >
      <v-card class="mx-auto pa-1" color="grey darken-3">
        <v-toolbar dense flat>
          <v-toolbar-title small class="mx-auto"
            >Filter Options</v-toolbar-title
          >
          <v-spacer></v-spacer>
          <v-btn icon @click="filterDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-sheet class="pa-3">
          <v-color-picker
            dot-size="19"
            hide-inputs
            class="mx-auto pt-5"
            v-model="tokenColorPicker"
          >
          </v-color-picker>
          <v-divider class="my-2"></v-divider>
          <div class="pa-5">
            <div class="text-caption text-center">Opacity</div>
            <v-slider
              min="0"
              max="100"
              color="colorPickerColor"
              thumb-color="grey darken-2"
              thumb-label
              hide-details
              class="mx-10"
              v-model="tokenOpacity"
              hint="Opacity"
            ></v-slider>
          </div>
        </v-sheet>
      </v-card>
    </v-dialog>
    <v-menu
      v-model="showObjectMenu"
      :position-x="menuX"
      :position-y="menuY"
      absolute
      offset-y
    >
      <v-color-picker
        v-model="tokenColorPicker"
        hide-inputs
        hide-canvas
        hide-sliders
        flat
        :swatches="swatches"
        show-swatches
      ></v-color-picker>
      <v-list>
        <v-list-item
          v-for="(item, index) in objectMenuItems"
          :key="index"
          @click="fireMenuTest(item.action)"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-menu
      v-model="showBgMenu"
      :position-x="menuX"
      :position-y="menuY"
      absolute
      offset-y
    >
      <v-list>
        <v-list-item
          v-for="(item, index) in bgMenuItems"
          :key="index"
          @click="fireMenuTest(item.action)"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-menu
      v-if="activeUsers"
      v-model="showActiveMenu"
      :position-x="menuX"
      :position-y="menuY"
      absolute
      offset-y
    >
      <v-list>
        <v-list-item
          v-for="(user, index) in activeUsers"
          :key="index"
          @click="giveAccess(user.uid)"
        >
          <v-list-item-title>{{ user.displayName }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-tooltip
      v-for="(item, index) in canvas._objects"
      :key="index"
      v-model="item.showToolTip"
      :position-x="item.toolTipX"
      :position-y="item.toolTipY"
      top
      absolute
      :color="item.marker ? item.fill : 'black'"
      content-class="tooltips"
    >
      <span> {{ item.name }}</span>
    </v-tooltip>
    <v-tooltip
      v-model="isMeasuring"
      :position-x="rulerToolTip.x"
      :position-y="rulerToolTip.y"
      bottom
      absolute
      color="rgba(0,139,139,0.6)"
      content-class="tooltips"
    >
      <span> {{ rulerLength.toFixed(2) }}</span>
    </v-tooltip>
    <v-snackbar
      transition="dialog-transition"
      color="rgba(0,0,0,0.6)"
      v-model="snackbar.show"
      timeout="6000"
    >
      <v-container class="ma-0 pa-0" fluid fill-height>
        <v-row justify="space-around" align="center">
          <v-col class="ma-0 pa-0" align="center">
            <span class="text--primary">{{ snackbar.message }}</span>
          </v-col>
        </v-row>
      </v-container>
    </v-snackbar>
    <v-snackbar
      transition="dialog-transition"
      rounded
      color="rgba(0,0,0,0.6)"
      v-model="shortSnackbar.show"
      timeout="2000"
    >
      <v-container class="ma-0 pa-0" fluid fill-height>
        <v-row justify="space-around" align="center">
          <v-col class="ma-0 pa-0" align="center">
            <span class="text--primary">{{ shortSnackbar.message }}</span>
          </v-col>
        </v-row>
      </v-container>
    </v-snackbar>
  </div>
</template>

<script>
import { auth, db, firebase } from "../db";
// import "firebase/storage";
import { fabric } from "fabric";
import { throttle, debounce } from "lodash";
const locationPin = require("../assets/svg/locationPin.svg");
const lightSVG = require("../assets/svg/light.svg");
import draggable from "vuedraggable";
import FogEffect from "./FogEffect.vue";

export default {
  name: "Canvas2",
  components: {
    draggable,
    FogEffect,
  },
  data: () => ({
    effects: null,
    locationPin: locationPin,
    hoverZoomEnabled: false,
    colors: ["blue", "red", "yellow", "orange", "green", "purple"],
    addMarker: false,
    drawMode: false,
    swatches: [
      ["#00000000", "#FF000033", "#FFFF0033"],
      ["#00FF0033", "#FFFFFF33", "#0000FF33"],
    ],
    objectLastPosition: {
      left: 0,
      top: 0,
      scaleX: 0,
      scaleY: 0,
      angle: 0,
    },
    dice: [
      {
        icon: {
          text: "mdi-dice-d20",
          total: 20,
        },
        two: {
          text: "2D20",
          total: 40,
        },
        three: {
          text: "3D20",
          total: 60,
        },
        four: {
          text: "4D20",
          total: 80,
        },
      },
      {
        icon: {
          text: "mdi-dice-d12",
          total: 12,
        },
        two: {
          text: "2D12",
          total: 24,
        },
        three: {
          text: "3D12",
          total: 36,
        },
        four: {
          text: "4D12",
          total: 48,
        },
      },
      {
        icon: {
          text: "mdi-dice-d10",
          total: 10,
        },
        two: {
          text: "2D10",
          total: 20,
        },
        three: {
          text: "3D10",
          total: 30,
        },
        four: {
          text: "4D10",
          total: 40,
        },
      },
      {
        icon: {
          text: "mdi-dice-d8",
          total: 8,
        },
        two: {
          text: "2D8",
          total: 16,
        },
        three: {
          text: "3D8",
          total: 24,
        },
        four: {
          text: "4D8",
          total: 32,
        },
      },
      {
        icon: {
          text: "mdi-dice-d6",
          total: 6,
        },
        two: {
          text: "2D6",
          total: 12,
        },
        three: {
          text: "3D6",
          total: 18,
        },
        four: {
          text: "4D6",
          total: 24,
        },
      },
      {
        icon: {
          text: "mdi-dice-d4",
          total: 4,
        },
        two: {
          text: "2D4",
          total: 20,
        },
        three: {
          text: "3D4",
          total: 12,
        },
        four: {
          text: "4D4",
          total: 16,
        },
      },
    ],
    eraseMode: false,
    touch: false,
    isTap: false,
    touchTime: 0,
    isTouchZoom: false,
    touchStartY: 0,
    touchZoomPoint: {
      x: 0,
      y: 0,
    },
    showToolTip: false,
    snackbar: {
      show: false,
      message: "",
    },
    shortSnackbar: {
      show: false,
      message: "",
    },
    colorPickerDialog: false,
    filterDialog: false,
    colorPickerColor: "#41A0E1",
    tokenColorPicker: "#FF000000",
    tokenOpacity: 1,
    strokeWidth: 1,
    drawing: false,
    erasing: false,
    dragging: false,
    headerHeight: 0,
    toolTip: {
      x: 0,
      y: 0,
      text: "",
    },
    toolTipText: "",
    markerColor: "green",
    mouse: {
      x: 0,
      y: 0,
    },
    zoom: 1,
    bgDrag: false,
    controlRef: null,
    tokenRef: null,
    markerRef: null,
    drawingsRef: null,
    objectSelected: false,
    tokens: {},
    canvas: {},
    minimap: {
      height: 100,
      width: 100,
    },
    minimapSquare: {
      width: "99px",
      height: "99px",
      border: "2px solid #111",
      position: "absolute",
      top: "0px",
      left: "0px",
    },
    changing: false,
    showDial: false,
    showDice: false,
    showAddMenu: false,
    drawingMode: "add",
    showAllNamesFlag: false,
    pencilWidth: 25,
    fillColor: "rgba(255,0,0,.5)",
    fab: false,
    tabs: null,
    showObjectMenu: false,
    showBgMenu: false,
    lightSVG: lightSVG,
    lightGroup: null,
    menuX: 0,
    menuY: 0,
    timeHolder: null,
    isRulerTool: false,
    rulerMeasurement: {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
    },
    rulerLength: 0,
    unscaledLength: 0,
    rulerToolTip: {
      x: 0,
      y: 0,
    },
    rulerLine: {},
    rulerCircle: {},
    isMeasuring: false,
    isCalibrating: false,
    mapScale: 1,
    showActiveMenu: false,
    objectMenuItems: [
      { title: "Filter", action: "filter" },
      { title: "Edit", action: "edit" },
      { title: "Delete", action: "delete" },
      { title: "Lock", action: "lock" },
      { title: "Give Access..", action: "giveaccess" },
    ],
    bgMenuItems: [
      { title: "Add Token", action: "addtoken" },
      { title: "Add Marker", action: "addmarker" },
      { title: "Add Light Source", action: "addlightsource" },
      { title: "Change Background", action: "changebackground" },
      { title: "Show All Names", action: "showallnames" },
      { title: "Calibrate Ruler", action: "calibratebg" },
    ],
    clickData: {},
    isTokenAdded: false,
    tokenAdded: {},
    colorPickerFlag: false,
  }),
  computed: {
    activeFab() {
      switch (this.tabs) {
        case "one":
          return { class: "purple", icon: "account_circle" };
        case "two":
          return { class: "red", icon: "edit" };
        case "three":
          return { class: "green", icon: "keyboard_arrow_up" };
        default:
          return {};
      }
    },
    isMobile() {
      return this.$vuetify.breakpoint.xs;
    },
    distanceFromSelected() {
      if (this.selected) {
        let s = this.selected;
        let m = this.mouse;
        return this.calculateDistance(s.left, s.top, m.x, m.y) * this.mapScale;
      }
      return 0;
    },
    selected: {
      get() {
        return this.$store.getters.selected;
      },
      set(newSelection) {
        return this.$store.dispatch("setSelected", newSelection);
      },
    },
    activeUsers() {
      return this.$store.getters.activeUsers;
    },
    editTokenDialog: {
      get() {
        return this.$store.getters.editTokenDialog;
      },
      set(val) {
        return this.$store.dispatch("setEditTokenDialog", val);
      },
    },
    viewport: {
      get() {
        return this.$store.getters.viewport;
      },
      set(val) {
        return this.$store.dispatch("setViewport", val);
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
    tokenList: {
      get() {
        return this.$store.getters.tokens;
      },
      set(newTokens) {
        return this.$store.dispatch("setTokens", newTokens);
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
    drawMode(val) {
      this.canvas.isDrawingMode = val;
    },
    eraseMode(val) {
      console.log("eraseMode: ", val);
    },
    colorPickerColor(color) {
      this.canvas.freeDrawingBrush.color = color;
    },
    strokeWidth(width) {
      this.canvas.freeDrawingBrush.width = width;
    },
    tokenColorPicker(color) {
      if (this.colorPickerFlag) return;
      console.log(color);
      this.debounce(this.setTokenColor, color);
    },
    tokenOpacity(opacity) {
      if (this.colorPickerFlag) return;
      console.log(opacity);
      this.debounce(this.setTokenOpacity, opacity);
    },
    activeBackground(val) {
      if (this.tokenRef !== null) {
        this.detachListeners();
      }
      this.attachListeners();

      if (val.mapScale) this.mapScale = val.mapScale;
    },
    stage(val) {
      if (val) {
        this.reloadSession();
      }
    },
  },
  methods: {
    debounce: debounce((func, x) => {
      func(x);
    }, 250),
    tokenFilter() {},
    setTokenColor(color) {
      if (!auth.currentUser) return;
      let click = this.clickData.target;
      let targets = click._objects ? click._objects : [click];
      // const batch = {};
      targets.forEach((target) => {
        var object = this.tokenRef.child(target.__id);
        let updates = {};
        if (target.type === "path") {
          updates = { fill: color };
          object = this.drawingsRef.child(target.__id);
        } else if (target.marker) {
          updates.fill = color;
          object = this.markerRef.child(target.__id);
        } else {
          updates.type = "BlendColor";
          updates.color = color;
          updates.mode = "tint";
          updates.alpha = this.getAlpha(color);
          object = object.child("filters");
        }
        object.update(updates);
        // console.log(this.getPath(object));
        // console.log(updates);
        // batch[this.getPath(object)] = updates;
      });
      // db.database()
      //   .ref()
      //   .update(batch);
    },
    async onPinDrop(e) {
      var headerHeight = this.$store.getters.headerHeight;
      var vpt = this.canvas.viewportTransform;
      var mouseX = e.originalEvent.x;
      var mouseY = e.originalEvent.y;
      let mouse = {};
      mouse.x = (mouseX - vpt[4]) / vpt[0];
      mouse.y = (mouseY - headerHeight - vpt[5]) / vpt[0];
      this.controlRef.push({
        timeStamp: firebase.database.ServerValue.TIMESTAMP,
        type: "pin",
        msg: mouse,
      });
    },
    delay300() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.canvas.getPointer());
        }, 500);
      });
    },
    getPath(ref) {
      let key = "";
      while (ref.parent) {
        key = ref.key.concat("/").concat(key);
        ref = ref.parent;
      }
      // key = key.slice(0, -1);
      return key;
    },
    setTokenOpacity(opacity) {
      console.log(opacity);
      if (!auth.currentUser) return;
      let target = this.clickData.target;
      var object = this.tokenRef.child(target.__id);
      if (target.type === "path") {
        object = this.drawingsRef.child(target.__id);
      } else if (target.marker) {
        object = this.markerRef.child(target.__id);
      }
      const updates = { opacity: opacity != 0 ? opacity / 100 : 0.001 };
      console.log(updates);

      object.update(updates);
    },
    startHandler(opt) {
      this.touch = true;
      this.showDice = false;
      this.showAddMenu = false;
      // this.canvas.isTDragging = true;
      this.canvas.selection = false;
      let e = opt.touches[0];
      if (opt.timeStamp - this.touchTime < 250) {
        this.isTouchZoom = true;
        this.touchStartY = e.clientY;
        this.touchZoomPoint = {
          x: e.clientX,
          y: e.clientY,
        };
      }
      this.touchTime = opt.timeStamp;
      this.canvas.lastPosX = e.clientX;
      this.canvas.lastPosY = e.clientY;

      // console.log("touch start", opt);
    },
    movingHandler(opt) {
      this.throttleLess(this.touchZoomPan, opt);
    },
    tapHandler() {
      this.isTap = true;
    },
    touchZoomPan(opt) {
      if (this.objectSelected) return;
      if (this.isRulerTool) return;
      if (this.drawMode) return;
      if (this.isTouchZoom) {
        let e = opt.touches[0];
        let delta = (this.touchStartY - e.clientY) * 8;
        this.touchStartY = e.clientY;
        var zoom = this.canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.05) zoom = 0.05;
        this.canvas.zoomToPoint(
          { x: this.touchZoomPoint.x, y: this.touchZoomPoint.y },
          zoom
        );
        return;
      }
      var vpt = this.canvas.viewportTransform;
      this.canvas.selection = false;
      let e = opt.touches[0];
      this.showObjectMenu = false;
      this.showBgMenu = false;
      vpt[4] += e.clientX - this.canvas.lastPosX;
      vpt[5] += e.clientY - this.canvas.lastPosY;
      this.viewport = vpt;
      this.canvas.requestRenderAll();
      this.canvas.lastPosX = e.clientX;
      this.canvas.lastPosY = e.clientY;
      this.viewport = vpt;
    },
    endHandler() {
      this.isTouchZoom = false;
      this.touch = false;
      console.log("touch over");
      // console.log("touch end");
    },
    giveAccess(uid) {
      if (!auth.currentUser) return;
      let target = this.clickData.target;
      var object = this.tokenRef.child(target.__id);
      if (target.type === "path") {
        object = this.drawingsRef.child(target.__id);
      } else if (target.marker) {
        object = this.markerRef.child(target.__id);
      }
      const updates = {
        hasAccess: uid,
      };
      object.update(updates);
    },
    fireMenuTest(action) {
      console.log(action, " clicked");
      if (action === "lock") {
        let target = this.clickData.target;
        target.selectable = !target.selectable;
        var token = this.tokenRef.child(target.__id);
        if (target.type === "path") {
          token = this.drawingsRef.child(target.__id);
        } else if (target.marker) {
          token = this.markerRef.child(target.__id);
        }
        const updates = {
          selectable: target.selectable,
        };
        if (auth.currentUser) token.update(updates);
      }
      if (action === "filter") {
        this.filterDialog = true;
      }
      if (action === "giveaccess") {
        // this.showObjectMenu = false;
        this.showActiveMenu = true;
      }
      if (action === "edit") {
        this.editTokenDialog = true;
      }
      if (action === "delete") {
        this.removeToken();
      }
      if (action === "addlightsource") {
        this.createLightSource();
      }
      if (action === "addmarker") {
        this.createMarker(this.clickData);
      }
      if (action === "showallnames") {
        this.showAllNames();
      }
      if (action === "calibratebg") {
        this.isCalibrating = true;
        this.isRulerTool = true;
        this.snackbar.show = true;
        this.snackbar.message = "approximate 5ft via mouse click and drag";
        this.canvas.defaultCursor = "crosshair";
      }
    },
    showAllNames() {
      let objects = this.canvas._objects;
      this.showAllNamesFlag = true;
      objects.forEach((target) => {
        if (target.name) {
          var vpt = this.canvas.viewportTransform;
          var headerHeight = this.$store.getters.headerHeight;
          var offsetY = (target.height * target.scaleY * vpt[0]) / 2;
          target.set({
            showToolTip: true,
            toolTipX: target.left * vpt[0] + vpt[4],
            toolTipY: target.top * vpt[0] + vpt[5] + headerHeight - offsetY,
          });
        }
      });
    },
    calculateDistance(x1, y1, x2, y2) {
      return Math.sqrt(
        Math.pow(x2 * 1 - x1 * 1, 2) + Math.pow(y2 * 1 - y1 * 1, 2)
      );
    },
    hideAllNames() {
      let objects = this.canvas._objects;
      objects.forEach((target) => {
        if (target.name) {
          target.set({
            showToolTip: false,
          });
        }
      });
    },
    getMenu(opt) {
      this.clickData = opt;
      if (opt.target) {
        this.colorPickerFlag = true;
        // if (opt.target.filters)
        //   this.tokenColorPicker = opt.target.filters[0].color;
        // else this.tokenColorPicker = opt.target.fill;
        if (opt.target.selectable) {
          this.objectMenuItems[2].title = "Lock";
        } else {
          this.objectMenuItems[2].title = "Unlock";
        }
        this.colorPickerFlag = false;
      }
      opt.e.preventDefault();
      this.showObjectMenu = false;
      this.showBgMenu = false;
      this.menuX = opt.e.clientX;
      this.menuY = opt.e.clientY;
      this.$nextTick(() => {
        if (opt.target) {
          this.showObjectMenu = true;
        } else {
          this.showBgMenu = true;
        }
      });
    },
    setMarkerColor() {
      if (this.addMarker) {
        this.markerColor = "dark";
        this.addMarker = false;
      } else {
        this.addMarker = true;
        this.markerColor = "orange";
      }
    },
    colorAdjust(color, amount) {
      return (
        "#" +
        color
          .replace(/^#/, "")
          .replace(/../g, (color) =>
            (
              "0" +
              Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(
                16
              )
            ).substr(-2)
          )
      );
    },
    createMarker() {
      // const pointer = this.canvas.getPointer();
      var shadow = new fabric.Shadow({
        color: "black",
        blur: 50,
        offsetX: 5,
        offsetY: 5,
        opacity: 0.8,
      });

      const marker = {
        originX: "center",
        originY: "center",
        top: this.mouse.y - 12,
        left: this.mouse.x,
        width: 25,
        angle: 180,
        height: 25,
        fill: this.colorPickerColor,
        stroke: "rgba(0,0,0,0.2)",
        strokeWidth: 3,
        shadow: shadow,
        opacity: 0.7,
        deletable: true,
        selectable: true,
        evented: true,
        name: "",
        notes: "",
        hasAccess: "",
        stage: this.stage.slug,
        owner: this.stage.owner,
      };
      this.markerRef.push(marker).catch((error) => {
        console.log("marker: ", error.message);
      });
    },
    dropPin(mouse) {
      this.canvas.skipOffscreen = false;
      fabric.loadSVGFromURL(this.locationPin, (objects, options) => {
        var pin = fabric.util.groupSVGElements(objects, options);
        let scale = (1 / this.zoom) * 0.3;
        let offset = 40 / this.zoom;
        console.log(offset);
        pin.set({
          originX: "center",
          originY: "center",
          evented: false,
          selectable: false,
          left: mouse.x,
          scaleX: scale,
          scaleY: scale,
          fill: "#ffea70",
          opacity: 0.7,
          top: mouse.y - 100 / this.zoom,
        });
        this.canvas.add(pin);
        pin.animate("top", mouse.y - offset, {
          duration: 100,
          onChange: this.canvas.renderAll.bind(this.canvas),
          onComplete: function() {},
        });

        pin.animate("opacity", 0, {
          duration: 1000,
          onChange: this.canvas.renderAll.bind(this.canvas),
          onComplete: () => {
            this.canvas.remove(pin);
          },
        });
        return pin;
      });
      this.canvas.skipOffscreen = true;
    },
    createLightSource() {
      fabric.loadSVGFromURL(this.lightSVG, (objects, options) => {
        var obj = fabric.util.groupSVGElements(objects, options);
        this.canvas.getHeight();
        obj.set({
          originX: "center",
          originY: "center",
          left: this.mouse.x,
          top: this.mouse.y,
          stage: this.stage.slug,
          owner: this.stage.owner,
          radius: (this.canvas.getHeight() / this.canvas.getZoom()) * 0.5,
          deletable: false,
        });
        this.lightRef.push(obj.toJSON()).catch((error) => {
          console.log("lights: ", error.message);
        });
      });
    },
    editLightMode() {
      if (!this.lightGroup.evented) {
        this.lightGroup.set({
          evented: true,
          selectable: true,
          globalCompositeOperation: "xor",
          opacity: 0.8,
          deletable: true,
        });
        this.canvas.renderAll();
      } else {
        this.lightGroup.set({
          evented: false,
          selectable: false,
          globalCompositeOperation: "destination-in",
          opacity: 1,
          deletable: false,
        });
        this.canvas.renderAll();
      }
    },
    testFunction() {
      console.log("Objects", this.canvas);
    },
    resetZoom() {
      let ratio = this.canvas.getHeight() / this.canvas.backgroundImage.height;
      this.canvas.setViewportTransform([ratio, 0, 0, ratio, 0, 0]);
      this.zoom = this.canvas.getZoom().toFixed(2);
      this.viewport = this.canvas.viewportTransform;
    },
    removeToken() {
      let selection = this.canvas.getActiveObject();
      if (!selection) {
        if (!this.selected) return;
        else {
          selection = this.selected;
        }
      }
      let selectedTokens = [];
      if (selection.type == "activeSelection") {
        selectedTokens = selection._objects;
      } else selectedTokens.push(selection);
      let discardSelection = true;
      selectedTokens.forEach((token) => {
        if (token.deletable) {
          if (token.type === "path") {
            const drawingFB = this.drawingsRef.child(token.__id);
            drawingFB.remove().catch((error) => {
              console.log("drawing delete: ", error.message);
            });
          } else if (token.marker) {
            const markerFB = this.markerRef.child(token.__id);
            markerFB.remove().catch((error) => {
              console.log("marker delete: ", error.message);
            });
          } else if (token.type === "image") {
            const tokenFB = this.tokenRef.child(token.__id);
            tokenFB.remove().catch((error) => {
              console.log("token delete: ", error.message);
            });
          } else if (token.type === "group") {
            if (token._objects.length > 5) discardSelection = false;
            else discardSelection = true;
            let lastLight = token._objects[token._objects.length - 1];
            const lightFB = this.lightRef.child(lastLight.__id);
            console.log("light removed");
            lightFB.remove().catch((error) => {
              console.log("light delete: ", error.message);
            });
          }
        }
      });
      if (discardSelection) this.canvas.discardActiveObject();
    },
    getTokenFromId(id) {
      return this.canvas.getObjects().filter((obj) => obj.__id === id)[0];
    },
    canvasScrollZoom(opt) {
      if (this.showObjectMenu) return;
      if (this.showAllNamesFlag) {
        this.hideAllNames();
        this.showAllNamesFlag = false;
      }
      var delta = opt.e.deltaY;
      console.log("delta: ", delta);
      var zoom = this.canvas.getZoom();
      // const oldZoom = zoom;
      zoom *= 0.999 ** delta;
      this.zoom = zoom.toFixed(2);
      var vpt = this.canvas.viewportTransform;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.05) zoom = 0.05;
      if (opt.target) {
        if (opt.target.name) {
          var target = opt.target;
          var headerHeight = this.$store.getters.headerHeight;
          var offsetY = (opt.target.height * opt.target.scaleY * vpt[0]) / 2;
          opt.target.set({
            showToolTip: true,
            toolTipX: target.left * vpt[0] + vpt[4],
            toolTipY: target.top * vpt[0] + vpt[5] + headerHeight - offsetY,
          });
        }
      }
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      vpt = this.canvas.viewportTransform;
      this.viewport = vpt;
      let miniHeight =
        (this.canvas.height / zoom / this.activeBackground.height) *
        this.minimap.height;
      let miniWidth =
        (this.canvas.width / zoom / this.activeBackground.width) *
        this.minimap.width;
      let miniLeft =
        (-(vpt[4] / this.activeBackground.width) * this.minimap.width) / zoom;
      let miniTop =
        (-(vpt[5] / this.activeBackground.height) * this.minimap.height) / zoom;
      if (miniLeft < 0) miniLeft = 0;
      if (miniLeft > this.minimap.width) miniLeft = this.minimap.width;
      if (miniTop < 0) miniTop = 0;
      if (miniTop > this.minimap.height) miniTop = this.minimap.height;
      this.minimapSquare.height = miniHeight + "px";
      this.minimapSquare.width = miniWidth + "px";
      this.minimapSquare.left = miniLeft + "px";
      this.minimapSquare.top = miniTop + "px";
      opt.e.preventDefault();
      opt.e.stopPropagation();
    },
    canvasMouseMove(opt, pointer) {
      if (this.canvas.isDragging) {
        var vpt = this.canvas.viewportTransform;
        if (opt.target) {
          opt.target.set({
            showToolTip: false,
          });
        }
        this.dragging = true;
        this.showObjectMenu = false;
        this.showBgMenu = false;
        var e = opt.e;
        vpt[4] += e.clientX - this.canvas.lastPosX;
        vpt[5] += e.clientY - this.canvas.lastPosY;
        this.canvas.requestRenderAll();
        this.canvas.lastPosX = e.clientX;
        this.canvas.lastPosY = e.clientY;
        this.viewport = vpt;
      }
      if (this.isMeasuring) {
        var vpt2 = this.canvas.viewportTransform;
        this.rulerMeasurement.x2 = pointer.x;
        this.rulerMeasurement.y2 = pointer.y;
        let line = this.rulerMeasurement;
        this.unscaledLength = this.calculateDistance(
          line.x1,
          line.y1,
          line.x2,
          line.y2
        );
        this.rulerLength = this.unscaledLength * this.mapScale;
        var hHeight = this.$store.getters.headerHeight;
        this.rulerToolTip.x = ((line.x1 + line.x2) / 2) * vpt2[0] + vpt2[4];
        this.rulerToolTip.y =
          ((line.y1 + line.y2) / 2) * vpt2[0] + vpt2[5] + hHeight;
        this.rulerCircle.set({
          radius: this.unscaledLength,
        });
        this.rulerLine.set({
          x2: pointer.x,
          y2: pointer.y,
        });
        this.rulerLine.setCoords();
        this.canvas.renderAll();
      }
      this.mouse.x = pointer.x;
      this.mouse.y = pointer.y;
    },
    throttle: throttle((func, opt, pointer) => {
      func(opt, pointer);
    }, 25),
    throttleLess: throttle((func, opt, pointer) => {
      func(opt, pointer);
    }, 19),
    getLightFromId(id) {
      return this.lightGroup.getObjects().filter((obj) => obj.__id === id)[0];
    },
    addTokenDrag(e) {
      if (this.bgDrag) {
        this.addBg(e);
        return;
      }
      const url = e.dataTransfer.getData("Text");
      var img = new Image();

      img.addEventListener("load", () => {
        // const width = ee.target.naturalWidth;
        // const height = ee.target.naturalHeight;
        // const name = "token_" + Object.keys(this.tokens).length + "";
        const name = "";
        const token = {
          stage: this.stage.slug,
          owner: this.stage.owner,
          name: name,
          url: url,
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
        };
        this.isTokenAdded = true;
        this.tokenAdded = token;
        this.snackbar.show = true;
        this.snackbar.message = "Click where you want to place token";
        this.canvas.defaultCursor = "crosshair";
      });
      img.src = url;
    },
    setBG(url) {
      fabric.Image.fromURL(url, (img) => {
        // img.scaleToHeight(this.canvas.getHeight());
        this.canvas.setBackgroundImage(img);
        if (this.effects && this.effects.fog) {
          img.set({
            opacity: 0.5,
          });
        }
        this.resetZoom();
        this.canvas.renderAll.bind(this.canvas);
        this.canvas.renderAll();
      });
    },
    addBg(e) {
      // console.log("add bg method");
      const url = e.dataTransfer.getData("Text");
      var img = new Image();
      img.addEventListener("load", (ee) => {
        const width = ee.target.naturalWidth;
        const height = ee.target.naturalHeight;
        const name = "bg_" + Object.keys(this.backgrounds).length;
        const background = {
          name: name,
          url: url,
          height: height,
          width: width,
          deletable: true,
          selectable: true,
          evented: true,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          stage: this.stage.slug,
          owner: this.stage.owner,
          mapScale: 1,
        };
        this.bgRef.push(background).catch((error) => {
          console.log("BG: ", error.message);
        });
      });
      img.src = url;
      this.bgDrag = false;
    },
    rollDice(roll) {
      var dice = roll.split("D");
      var rolls = dice[0];
      var die = dice[1];
      var sum = 0;
      var results = [];
      while (rolls > 0) {
        let result = Math.floor(Math.random() * die) + 1;
        sum += result;
        results.push(result);
        rolls--;
      }
      let text = `${roll} rolled!\nResults: ${results}\nTotal: ${sum}`;
      this.snackbar.show = true;
      this.snackbar.message = text;

      if (!auth.currentUser) return;
      let message = {
        message: text,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        uid: this.user.uid,
        name: this.user.displayName.split(" ")[0],
        diceRoll: true,
      };

      const path = `users/${this.stage.owner}/stages/${this.stage.slug}`;
      const chatPath = `${path}/chat`;

      db.database()
        .ref(chatPath)
        .push(message, (error) => {
          if (error) {
            console.log("chat tx error", error);
          }
        });
    },
    getAlpha(hex) {
      return parseInt(hex.slice(-2), 16) / 255;
    },
    detachListeners() {
      if (this.tokenRef !== null) this.tokenRef.off();
      if (this.markerRef !== null) this.markerRef.off();
      if (this.drawingsRef !== null) this.drawingsRef.off();
      if (this.lightRef !== null) this.lightRef.off();
      if (this.controlRef !== null) this.controlRef.off();
      if (this.effectsRef !== null) this.effectsRef.off();
      this.canvas.clear();
      this.tokenList = null;
      return true;
    },
    attachListeners() {
      const slug = `users/${this.stage.owner}/stages/${this.stage.slug}`;
      const bgSlug = slug + "/backgrounds/" + this.activeBackground.__id;
      this.controlRef = db.database().ref(slug.concat("/control"));
      this.tokenRef = db.database().ref(bgSlug + "/tokens");
      this.markerRef = db.database().ref(bgSlug + "/markers");
      this.drawingsRef = db.database().ref(bgSlug + "/drawings");
      this.lightRef = db.database().ref(bgSlug + "/light");
      this.effectsRef = db.database().ref(bgSlug + "/efects");

      this.effectsRef.on("value", (snapshot) => {
        this.effects = snapshot.val();
        if (this.canvas.backgroundImage) {
          if (this.effects && this.effects.fog) {
            this.canvas.backgroundImage.opacity = 0.5;
          } else {
            this.canvas.backgroundImage.opacity = 1;
          }
        }
        this.canvas.renderAll();
      });

      this.controlRef.on("value", (snapshot) => {
        if (this.timeHolder === null) {
          this.timeHolder = Date.now();
        } else if (Date.now() - this.timeHolder < 200) return;
        this.timeHolder = Date.now();
        const controlData = Object.values(snapshot.val()).pop();
        let timeSinceUpdate = Date.now() - controlData.timeStamp;
        if (timeSinceUpdate < 60000) {
          console.log("control update");
          switch (controlData.type) {
            case "vpt":
              console.log("vpt");
              if (
                !auth.currentUser ||
                auth.currentUser.uid !== this.stage.owner
              ) {
                this.canvas.setViewportTransform(controlData.msg);
              }
              break;
            case "pin":
              console.log("pin");
              this.dropPin(controlData.msg);
              break;
          }
        }
      });
      this.tokenRef.on("value", (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        let tokens = [];
        Object.keys(data).forEach((key) => {
          let tokenObj = { ...data[key] };
          tokenObj.__id = key;
          tokens.push(tokenObj);
        });
        this.tokens = tokens;
        this.tokenList = tokens;
      });
      this.tokenRef.on("child_added", (snapshot) => {
        // console.log("CHILD_ADDED", snapshot.val().url);
        console.log("ca");
        const data = snapshot.val();
        let hasAccess = false;
        if (this.user)
          if (data.hasAccess) hasAccess = data.hasAccess == this.user.uid;
        fabric.Image.fromURL(
          data.url,
          (img) => {
            var shadow = new fabric.Shadow({
              color: "black",
              blur: 28,
              offsetX: 5,
              offsetY: 5,
              opacity: 0.5,
            });
            img.set({
              stage: data.slug,
              owner: data.owner,
              __id: snapshot.key,
              top: data.top,
              left: data.left,
              scaleX: data.scaleX,
              scaleY: data.scaleY,
              deletable: data.deletable,
              opacity: data.opacity ? data.opacity : 1,
              selectable: (this.isOwner && data.selectable) || hasAccess,
              // hasAccess: hasAccess,
              evented: data.evented,
              angle: data.angle,
              shadow: shadow,
              name: data.name,
              race: data.race,
              sendToBack: data.sendToBack,
              marker: false,
              notes: data.notes,
              visible: data.visible,
              tokenGroup: data.tokenGroup ? data.tokenGroup : 0,
              showToolTip: false,
              toolTipX: 0,
              toolTipY: 0,
              originX: "center",
              originY: "center",
              centeredScaling: true,
              // hasBorders: false,
              lockScalingX: this.isOwner ? false : true,
              lockScalingY: this.isOwner ? false : true,
            });
            img.setControlsVisibility({
              mt: false, // middle top disable
              mb: false, // midle bottom
              ml: false, // middle left
              mr: false, // I think you get it
              br: this.isOwner ? true : false,
              bl: this.isOwner ? true : false,
              tr: this.isOwner ? true : false,
              tl: this.isOwner ? true : false,
            });

            img.setCoords();
            img.filters.push(new fabric.Image.filters.BlendColor(data.filters));
            img.applyFilters();
            this.canvas.add(img);
            if (img.sendToBack) this.canvas.sendToBack(img);
            else this.canvas.bringToFront(img);
          },
          { crossOrigin: "" }
        );
      });
      this.markerRef.on("child_added", (snapshot) => {
        // console.log("Marker_ADDED", snapshot.val());
        const data = snapshot.val();
        var triangle = new fabric.Triangle(data);
        var shadow = new fabric.Shadow({
          color: this.colorAdjust(data.fill, -130),
          blur: 15,
          offsetX: 0,
          offsetY: 17,
          opacity: 0.1,
        });
        triangle.set({
          stage: data.stage,
          owner: data.owner,
          __id: snapshot.key,
          marker: true,
          name: data.name,
          opacity: data.opacity ? data.opacity : 0.8,
          deletable: data.deletable,
          selectable: this.isOwner && data.selectable,
          evented: data.evented,
          notes: data.notes,
          shadow: shadow,
        });
        // this.canvas.add(triangle).setActiveObject(triangle);
        this.canvas.add(triangle);
        triangle.setCoords();
        this.canvas.renderAll();
      });
      this.lightRef.on("child_added", (snapshot) => {
        if (this.lightGroup === null) {
          var r1 = new fabric.Rect({
            left: 0,
            top: 0,
            width: 10,
            height: 10,
            originX: "center",
            originY: "center",
            selectable: false,
            evented: false,
            boundary: true,
            stage: this.stage.slug,
            owner: this.stage.owner,
            __id: "0",
            // fill: "rgba(255,127,39,1)",
            stroke: "rgba(34,177,76,1)",
            strokeWidth: 5,
          });
          var r2 = new fabric.Rect({
            left: 0,
            top: this.activeBackground.height,
            width: 10,
            height: 10,
            originX: "center",
            originY: "center",
            selectable: false,
            evented: false,
            boundary: true,
            stage: this.stage.slug,
            owner: this.stage.owner,
            __id: "0",
            // fill: "rgba(255,127,39,1)",
            stroke: "rgba(34,177,76,1)",
            strokeWidth: 5,
          });
          var r3 = new fabric.Rect({
            left: this.activeBackground.width,
            top: 0,
            width: 10,
            height: 10,
            originX: "center",
            originY: "center",
            selectable: false,
            evented: false,
            boundary: true,
            stage: this.stage.slug,
            owner: this.stage.owner,
            __id: "0",
            // fill: "rgba(255,127,39,1)",
            stroke: "rgba(34,177,76,1)",
            strokeWidth: 5,
          });
          var r4 = new fabric.Rect({
            left: this.activeBackground.width,
            top: this.activeBackground.height,
            width: 10,
            height: 10,
            originX: "center",
            originY: "center",
            selectable: false,
            evented: false,
            boundary: true,
            stage: this.stage.slug,
            owner: this.stage.owner,
            __id: "0",
            // fill: "rgba(255,127,39,1)",
            stroke: "rgba(34,177,76,1)",
            strokeWidth: 5,
          });
          this.lightGroup = new fabric.Group([r1, r2, r3, r4], {
            originX: "center",
            originY: "center",
            evented: false,
            selectable: false,
            globalCompositeOperation: "destination-in",
          });
          this.canvas.add(this.lightGroup);
        }
        let light = new fabric.Circle(snapshot.val()).set({
          __id: snapshot.key,
          boundary: false,
        });
        this.lightGroup.addWithUpdate(light);

        // this.lightGroup.setCoords();
        this.canvas.moveTo(this.lightGroup, -2);
        this.canvas.renderAll();
      });
      // this.lightRef.on("child_changed", (snapshot) => {
      //   console.log(snapshot);
      // });
      this.lightRef.on("child_removed", (snapshot) => {
        const key = snapshot.key;
        let light = this.getLightFromId(key);
        console.log(light, key, this.canvas._objects);
        this.lightGroup.remove(light);
        if (this.lightGroup._objects.length === 4) {
          this.canvas.remove(this.lightGroup);
          this.lightGroup = null;
        }
        this.canvas.requestRenderAll();
      });
      this.drawingsRef.on("child_added", (snapshot) => {
        // console.log("Drawing Added", snapshot.val());
        const data = snapshot.val();
        var path = new fabric.Path(data.path, data);
        path.set({
          stage: data.stage,
          owner: data.owner,
          __id: snapshot.key,
          deletable: data.deletable,
          selectable: this.isOwner && data.selectable,
          evented: data.evented,
          name: data.name,
          notes: data.notes,
        });
        this.canvas.add(path);
        this.canvas.moveTo(path, -1);
      });
      this.tokenRef.on("child_removed", (snapshot) => {
        console.log("TOKEN_REMOVED");
        const id = snapshot.key;
        const token = this.getTokenFromId(id);
        this.canvas.remove(token);
      });
      this.markerRef.on("child_removed", (snapshot) => {
        console.log("MARKER_REMOVED");
        const id = snapshot.key;
        const token = this.getTokenFromId(id);
        this.canvas.remove(token);
      });
      this.drawingsRef.on("child_removed", (snapshot) => {
        console.log("drawing removed");
        const id = snapshot.key;

        const token = this.getTokenFromId(id);
        this.canvas.remove(token);
      });
      this.tokenRef.on("child_changed", (snapshot) => {
        if (this.changing) return;
        // this.canvas.discardActiveObject();
        const data = snapshot.val();
        const id = snapshot.key;
        let hasAccess;
        if (!auth.currentUser) hasAccess = false;
        else if (data.hasAccess) hasAccess = data.hasAccess == this.user.uid;
        if (data.sendToBack) this.canvas.sendToBack(this.getTokenFromId(id));
        else this.canvas.bringToFront(this.getTokenFromId(id));
        for (const i in this.canvas._objects) {
          if (this.canvas._objects[i].__id === id) {
            this.canvas._objects[i].set({
              name: data.name,
              race: data.race,
              notes: data.notes,
              visible: data.visible,
              opacity: data.opacity ? data.opacity : 1,
              hasAccess: data.hasAccess,
              deletable: data.deletable,
              selectable:
                (this.isOwner && data.selectable) ||
                (hasAccess && data.selectable),
              evented: data.evented,
              sendToBack: data.sendToBack,
              tokenGroup: data.tokenGroup,
            });
            const filter = this.canvas._objects[i].filters[0];
            if (filter.color != data.filters.color) {
              console.log(this.canvas._objects[i].filters[0], data.filters);
              this.canvas._objects[i].filters[0].color = data.filters.color;
              this.canvas._objects[i].filters[0].alpha = data.filters.alpha;
              this.canvas._objects[i].applyFilters();
            } else {
              this.canvas._objects[i].animate("angle", data.angle, {});
              this.canvas._objects[i].animate("scaleX", data.scaleX, {});
              this.canvas._objects[i].animate("scaleY", data.scaleY, {});
              this.canvas._objects[i].animate("left", data.left, {});
              this.canvas._objects[i].animate("top", data.top, {
                onChange: this.canvas.renderAll.bind(this.canvas),
              });
            }
          }
        }
        this.canvas.requestRenderAll();
      });
      this.markerRef.on("child_changed", (snapshot) => {
        if (this.changing) return;
        // this.canvas.discardActiveObject();
        const data = snapshot.val();
        const id = snapshot.key;
        for (const i in this.canvas._objects) {
          if (this.canvas._objects[i].__id === id) {
            this.canvas._objects[i].animate("left", data.left, {});
            this.canvas._objects[i].animate("top", data.top, {
              onChange: this.canvas.renderAll.bind(this.canvas),
            });
            this.canvas._objects[i].set({
              scaleX: data.scaleX,
              scaleY: data.scaleY,
              deletable: data.deletable,
              fill: data.fill,
              opacity: data.opacity ? data.opacity : 0.8,
              selectable: this.isOwner && data.selectable,
              evented: data.evented,
              angle: data.angle,
              name: data.name,
              notes: data.notes,
            });
            this.canvas._objects[i].setCoords();
            this.canvas.requestRenderAll();
          }
        }
      });
      this.drawingsRef.on("child_changed", (snapshot) => {
        if (this.changing) return;
        // this.canvas.discardActiveObject();
        const data = snapshot.val();
        const id = snapshot.key;
        for (const i in this.canvas._objects) {
          // if (this.canvas._objects[i].fill != data.fill) {
          if (this.canvas._objects[i].__id === id) {
            // this.canvas._objects[i].animate("left", data.left, {});
            // this.canvas._objects[i].animate("top", data.top, {
            //   onChange: this.canvas.renderAll.bind(this.canvas),
            // });
            this.canvas._objects[i].set({
              scaleX: data.scaleX,
              scaleY: data.scaleY,
              deletable: data.deletable,
              selectable: this.isOwner && data.selectable,
              evented: data.evented,
              fill: data.fill ? data.fill : "#555555",
              opacity: data.opacity ? data.opacity : 1,
              globalCompositeOperation: data.globalCompositeOperation,
              angle: data.angle,
              left: data.left,
              top: data.top,
              name: data.name,
              notes: data.notes,
              stroke: data.stroke,
              strokeWidth: data.strokeWidth,
            });
            this.canvas._objects[i].setCoords();
            this.canvas.requestRenderAll();
          }
        }
      });
    },
    reloadSession() {
      console.log("reoladSession");
      if (this.sessionRef) this.sessionRef.off();
      if (this.bgRef) this.bgRef.off();
      const slug = `users/${this.stage.owner}/stages/${this.stage.slug}`;
      this.sessionRef = db.database().ref(slug + "/session");
      this.bgRef = db.database().ref(slug + "/backgrounds");
      this.bgRef.on("value", (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        let backgrounds = [];
        Object.keys(data).forEach((key) => {
          let bgObject = { ...data[key] };
          bgObject.__id = key;
          delete bgObject.tokens;
          delete bgObject.drawings;
          delete bgObject.markers;
          delete bgObject.light;
          backgrounds.push(bgObject);
        });
        this.backgrounds = backgrounds;
      });
      // this.bgRef.on("child_changed", (snapshot) => {
      //   console.log("BG CHANGED");
      //   if (this.activeBackground.__id === snapshot.key) {
      //     if (snapshot.val().mapScale) this.mapScale == snapshot.val().mapScale;
      //   }
      // });
      this.sessionRef
        .child(1)
        .get()
        .then((result) => {
          if (!result.val()) {
            return;
          }
          this.activeBackground = result.val().activeBackground;
          this.setBG(this.activeBackground.url);
          // this.attachListeners();
        });
      this.sessionRef.on("child_changed", (snapshot) => {
        console.log("sessionRef child_changed");
        this.setBG(snapshot.val().activeBackground.url);
        this.activeBackground = snapshot.val().activeBackground;
      });
      // this.sessionRef.on("child_added", (snapshot) => {
      //   console.log("sessionRef child_added");
      //   this.setBG(snapshot.val().activeBackground.url);
      //   this.activeBackground = snapshot.val().activeBackground;
      // });
    },
  },
  mounted() {
    const ref = this.$refs.can;
    this.headerHeight = this.$store.getters.headerHeight;
    this.canvas = new fabric.Canvas(ref, {
      fireRightClick: true, // <-- enable firing of right click events
      fireMiddleClick: true, // <-- enable firing of middle click events
      stopContextMenu: true, // <--  prevent context menu from showing
    });

    this.reloadSession();
    const fullWidth = window.innerWidth;
    const fullHeight = window.innerHeight - this.headerHeight - 5;
    this.canvas.setDimensions({ width: fullWidth, height: fullHeight });
    window.addEventListener("resize", () => {
      const fullWidth = window.innerWidth;
      const fullHeight = window.innerHeight;
      this.canvas.setDimensions({ width: fullWidth, height: fullHeight });
    });
    window.addEventListener("keyup", (e) => {
      if (this.editTokenDialog) return;
      if (e.key == "Escape") {
        if (this.changing) {
          this.canvas.getActiveObject().set({
            left: this.objectLastPosition.left,
            top: this.objectLastPosition.top,
            scaleX: this.objectLastPosition.scaleX,
            scaleY: this.objectLastPosition.scaleY,
            angle: this.objectLastPosition.angle,
          });
        } else {
          this.canvas.discardActiveObject();
        }
        this.canvas.requestRenderAll();
      }
      if (e.key == "Delete") {
        this.removeToken();
      }
      if (e.key == "b" && e.altKey) {
        this.drawMode = !this.drawMode;
      }
      if (e.key == "p" && e.altKey) {
        console.log(e);
        this.colorPickerDialog = !this.colorPickerDialog;
      }
      if (e.key == "a" && e.altKey) {
        // select alla
      }
      if (e.key == "l" && e.altKey) {
        this.createLightSource();
      }
      if (e.key == "k" && e.altKey) {
        this.editLightMode();
      }
    });
    this.canvas.on({
      "mouse:down": (opt) => {
        if (this.touch) {
          console.log("TOUCH ME BABY", opt.e);
        }
        var evt = opt.e;
        if (this.showAllNamesFlag) {
          this.hideAllNames();
          this.showAllNamesFlag = false;
        }
        if (this.drawMode) {
          this.drawing = true;
          console.log("start drawing");
          return;
        }
        if (evt.button === 2 || evt.altKey === true) {
          this.canvas.isDragging = true;
          this.canvas.selection = false;
          this.canvas.lastPosX = evt.clientX;
          this.canvas.lastPosY = evt.clientY;
        }
        if (
          evt.button === 1 ||
          this.isRulerTool ||
          (evt.ctrlKey && evt.button === 0)
        ) {
          this.canvas.isDragging = false;
          this.canvas.selection = false;
          console.log("Start Measuring");
          var pointer = this.canvas.getPointer();
          var points = [pointer.x, pointer.y, pointer.x, pointer.y];
          this.rulerMeasurement.x1 = pointer.x;
          this.rulerMeasurement.y1 = pointer.y;
          this.rulerMeasurement.x2 = pointer.x;
          this.rulerMeasurement.y2 = pointer.y;
          var hHeight = this.$store.getters.headerHeight;
          var vpt = this.canvas.viewportTransform;
          this.rulerToolTip.x = pointer.x * vpt[0] + vpt[4];
          this.rulerToolTip.y = pointer.y * vpt[0] + vpt[5] + hHeight;
          this.rulerCircle = new fabric.Circle({
            strokeWidth: 2,
            stroke: "cyan",
            opacity: 0.6,
            fill: "transparent",
            originX: "center",
            originY: "center",
            selectable: false,
            evented: false,
            left: pointer.x,
            top: pointer.y,
          });
          this.rulerLine = new fabric.Line(points, {
            strokeWidth: 2,
            stroke: "cyan",
            opacity: 0.6,
            originX: "center",
            originY: "center",
            selectable: false,
            evented: false,
          });
          this.canvas.add(this.rulerLine, this.rulerCircle);
          this.rulerLine.setCoords();
          this.rulerCircle.setCoords();
          this.canvas.renderAll();
          this.isMeasuring = true;
        }
      },
      "touch:drag": (opt) => {
        console.log("TOUCH, DRAG", opt);
      },
      "mouse:move": (opt) => {
        const pointer = this.canvas.getPointer();
        this.throttle(this.canvasMouseMove, opt, pointer);
      },
      "mouse:up": (opt) => {
        this.canvas.isDragging = false;
        if (this.isTap) {
          if (opt.target) {
            this.shortSnackbar.show = true;
            this.shortSnackbar.message = opt.target.name;
          }
          this.isTap = false;
        }
        if (this.drawing) {
          console.log("stop drawing");
          this.drawing = false;
        }
        if (this.isMeasuring) {
          this.canvas.remove(this.rulerLine, this.rulerCircle);
          this.rulerLine = {};
          this.isMeasuring = false;
          if (this.isCalibrating) {
            let mapScale = 5 / this.unscaledLength;
            this.isCalibrating = false;
            this.isRulerTool = false;
            this.canvas.defaultCursor = "default";
            const bgObject = this.bgRef.child(this.activeBackground.__id);
            const sessionObj = this.sessionRef.child("1/activeBackground");
            bgObject
              .update({
                mapScale: mapScale,
              })
              .then(() => {
                sessionObj
                  .update({
                    mapScale: mapScale,
                  })
                  .then(() => {
                    this.snackbar.show = true;
                    this.snackbar.message = "Calibration complete!";
                  })
                  .catch((error) => {
                    this.snackbar.show = true;
                    this.snackbar.message = "Calibration Failed!";
                    console.log("mapScale Error - session", error);
                  });
              })
              .catch((error) => {
                this.snackbar.show = true;
                this.snackbar.message = "Calibration Failed!";
                console.log("mapScale Error - bg", error);
              });
          }
        }

        if (this.isTokenAdded && opt.e.button !== 2) {
          let mouse = this.canvas.getPointer();
          this.tokenAdded.top = mouse.y;
          this.tokenAdded.left = mouse.x;
          this.tokenRef.push(this.tokenAdded).catch((error) => {
            console.log("token: ", error.message);
          });
          this.isTokenAdded = false;
          this.tokenAdded = {};
          this.snackbar.show = false;
          this.canvas.defaultCursor = "default";
        }
        if (opt.e.button === 2 && !this.dragging && !this.drawMode) {
          this.canvas.isDragging = false;
          this.dragging = false;
          this.getMenu(opt);
          if (this.isTokenAdded) {
            this.isTokenAdded = false;
            this.tokenAdded = {};
            this.snackbar.show = false;
            this.canvas.defaultCursor = "default";
          }
        }
        if (opt.target) {
          const selection = opt.target;
          if (!selection) return;
          if (selection.type == "activeSelection") return;
          this.selected = selection.toJSON([
            "stage",
            "owner",
            "__id",
            "deletable",
            "selectable",
            "evented",
            "name",
            "race",
            "notes",
            "marker",
          ]);
        }
        // on mouse up we want to recalculate new interaction
        // for all objects, so we call setViewportTransform
        this.canvas.setViewportTransform(this.canvas.viewportTransform);
        this.canvas.isDragging = false;
        this.dragging = false;
        this.canvas.selection = true;
        if (this.addMarker) {
          this.createMarker(opt);
          this.setMarkerColor();
        }
      },

      // ---------- SCROLL ZOOM ----------
      "mouse:wheel": (opt) => {
        this.throttle(this.canvasScrollZoom, opt);
      },
      "selection:created": (e) => {
        console.log("object selected");
        this.objectSelected = true;
        const selection = this.canvas.getActiveObject();
        if (!selection) return;
        this.objectLastPosition.left = selection.left;
        this.objectLastPosition.top = selection.top;
        if (this.hoverZoomEnabled) {
          this.objectLastPosition.scaleX =
            selection.type == "activeSelection"
              ? selection.scaleX
              : selection.scaleX / 1.05;
          this.objectLastPosition.scaleY =
            selection.type == "activeSelection"
              ? selection.scaleY
              : selection.scaleY / 1.05;
        }
        this.objectLastPosition.angle = selection.angle;
        if (selection.type == "activeSelection") return;
        if (
          e.target.type !== "path" &&
          e.target.type !== "circle" &&
          e.target.type !== "group"
        ) {
          if (this.hoverZoomEnabled) {
            e.target.set({
              scaleX: e.target.scaleX / 1.05,
              scaleY: e.target.scaleY / 1.05,
              showToolTip: false,
            });
          } else e.target.set({ showToolTip: false });
        }
        this.selected = selection.toJSON([
          "stage",
          "owner",
          "__id",
          "deletable",
          "selectable",
          "evented",
          "name",
          "race",
          "notes",
          "marker",
        ]);
        this.showToolTip = false;
      },
      "selection:cleared": () => {
        console.log("object deselected");
        this.objectSelected = false;
        this.selected = false;
      },
      "selection:updated": (e) => {
        console.log("object selection updated");
        const selection = this.canvas.getActiveObject();
        this.objectSelected = true;
        this.objectLastPosition.left = selection.left;
        this.objectLastPosition.top = selection.top;
        if (this.hoverZoomEnabled) {
          this.objectLastPosition.scaleX =
            selection.type == "activeSelection"
              ? selection.scaleX
              : selection.scaleX / 1.05;
          this.objectLastPosition.scaleY =
            selection.type == "activeSelection"
              ? selection.scaleY
              : selection.scaleY / 1.05;
        }
        this.objectLastPosition.angle = selection.angle;
        if (selection.type == "activeSelection") return;
        if (
          e.target.type !== "path" &&
          e.target.type !== "circle" &&
          e.target.type !== "group"
        ) {
          if (this.hoverZoomEnabled) {
            e.target.set({
              scaleX: e.target.scaleX / 1.05,
              scaleY: e.target.scaleY / 1.05,
              showToolTip: false,
            });
          } else {
            e.target.set({
              showToolTip: false,
            });
          }
        }
        this.selected = selection.toJSON([
          "stage",
          "owner",
          "__id",
          "deletable",
          "selectable",
          "evented",
          "name",
          "race",
          "notes",
          "marker",
        ]);
        this.showToolTip = false;
        if (!selection) return;
      },
      "object:moving": () => {
        this.showToolTip = false;
        this.changing = true;
      },
      "object:rotating": () => {
        this.showToolTip = false;
        this.changing = true;
      },
      "object:scaling": () => {
        this.showToolTip = false;
        this.changing = true;
      },
      "mouse:over": (e) => {
        if (e.target == null) return;
        if (this.objectSelected) {
          if (e.target.__id === this.selected.__id) return;
          if (e.target.type == "activeSelection") return;
        }
        if (this.canvas.isDragging) return;
        if (
          e.target.type !== "path" &&
          e.target.type !== "circle" &&
          e.target.type !== "group"
        ) {
          if (this.hoverZoomEnabled) {
            e.target.set({
              scaleX: e.target.scaleX * 1.05,
              scaleY: e.target.scaleY * 1.05,
            });
          }
        }

        if (e.target.name) {
          var target = e.target;
          var vpt = this.canvas.viewportTransform;
          var headerHeight = this.$store.getters.headerHeight;
          var offsetY = (e.target.height * e.target.scaleY * vpt[0]) / 2;
          e.target.set({
            showToolTip: true,
            toolTipX: target.left * vpt[0] + vpt[4],
            toolTipY: target.top * vpt[0] + vpt[5] + headerHeight - offsetY,
          });
          this.canvas.renderAll();
        }
      },
      "mouse:out": (e) => {
        if (e.target == null) return;
        e.target.set({
          showToolTip: false,
        });
        if (this.objectSelected) {
          if (e.target.__id === this.selected.__id) return;
          if (e.target.type == "activeSelection") return;
        }
        if (this.canvas.isDragging) return;
        if (
          e.target.type !== "path" &&
          e.target.type !== "circle" &&
          e.target.type !== "group"
        ) {
          if (this.hoverZoomEnabled) {
            e.target.set({
              scaleX: e.target.scaleX / 1.05,
              scaleY: e.target.scaleY / 1.05,
            });
          }
        }
        this.canvas.renderAll();
      },
      "path:created": (e) => {
        var newDrawing = e.path;
        this.canvas.remove(newDrawing);
        if (newDrawing.path.length < 4) return;
        newDrawing.set({
          originX: "center",
          originY: "center",
        });
        const offsetX = (newDrawing.width + this.strokeWidth) / 2;
        const offsetY = (newDrawing.height + this.strokeWidth) / 2;
        let drawing = newDrawing.toJSON();
        drawing.name = "";
        drawing.stage = this.stage.slug;
        drawing.owner = this.stage.owner;
        drawing.notes = "";
        drawing.hasAccess = "";
        drawing.deletable = true;
        drawing.selectable = true;
        drawing.evented = true;
        drawing.left = drawing.left + offsetX;
        drawing.top = drawing.top + offsetY;
        drawing.fill = "transparent";
        this.drawingsRef.push(drawing).catch((error) => {
          console.log("drawing: ", error.message);
        });
      },
      "object:modified": (e) => {
        if (!this.changing) return;
        if (e.target.type === "textbox") return;
        var objects = [];
        if (auth.currentUser) {
          if (e.target._objects != undefined) {
            const brokenObjects = this.canvas.getActiveObjects();
            const canvasJSON = this.canvas.toJSON([
              "stage",
              "owner",
              "__id",
              "deletable",
              "selectable",
              "evented",
              "name",
              "race",
              "notes",
              "marker",
            ]).objects;
            brokenObjects.forEach((broke) => {
              canvasJSON.forEach((json) => {
                if (broke.__id === json.__id) objects.push(json);
              });
            });
          } else {
            objects.push(e.target);
            this.canvas.bringToFront(e.target);
          }
          objects.forEach((object) => {
            if (object.type === "path") {
              const drawing = this.drawingsRef.child(object.__id);
              const updates = {
                top: object.top,
                left: object.left,
                scaleX: object.scaleX,
                scaleY: object.scaleY,
                deletable: object.deletable,
                selectable: object.selectable,
                evented: object.evented,
                angle: object.angle,
                path: object.path,
                originX: object.originX,
                originY: object.originY,
                stroke: object.stroke,
                strokeWidth: object.strokeWidth,
              };
              drawing.update(updates).catch((error) => {
                console.log("drawing update: ", error.message);
              });
            } else if (object.marker) {
              const marker = this.markerRef.child(object.__id);
              const updates = {
                top: object.top,
                left: object.left,
                scaleX: object.scaleX,
                deletable: object.deletable,
                selectable: object.selectable,
                evented: object.evented,
                scaleY: object.scaleY,
                angle: object.angle,
              };
              marker.update(updates);
            } else if (object.type === "image") {
              const token = this.tokenRef.child(object.__id);
              const updates = {
                top: object.top,
                left: object.left,
                deletable: object.deletable,
                selectable: object.selectable,
                evented: object.evented,
                scaleX: object.scaleX,
                scaleY: object.scaleY,
                angle: object.angle,
              };
              token.update(updates);
            }
          });
        }
        this.changing = false;
      },
    });
  },
};
</script>
<style>
.minimap {
  /* border: 1px solid white; */
  position: absolute !important;
  top: 20px;
  left: 20px;
  opacity: 0.9;
}
.tooltips {
  margin: 0 auto;
  text-align: center;
  vertical-align: middle;
  font: caption;
}
.html {
  overflow-y: hidden;
}
.fixed {
  position: fixed;
  /* this fixes overflow y problem when window resizes */
}
html,
body {
  margin: 0;
  padding: 0;
}
body {
  background: #000;
  background: rgba(0, 0, 0, 1);
  overflow-x: hidden;
}
</style>
