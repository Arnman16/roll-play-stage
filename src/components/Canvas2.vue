<template>
  <div>
    <v-container fluid class="pa-0">
      <div
        @drop.prevent="addTokenDrag"
        @dragover.prevent
        v-on:dblclick="resetZoom"
      >
        <canvas ref="can"></canvas>
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
        <v-speed-dial
          fab
          v-model="fab"
          bottom
          left
          direction="right"
          open-on-hover
          transition="slide-y-reverse-transition"
          style="position: absolute; bottom: -20px; left: 10px"
        >
          <template v-slot:activator>
            <v-btn v-model="fab" :color="colorPickerColor" dark fab>
              <v-icon v-if="fab"> mdi-close </v-icon>
              <v-icon v-else> mdi-cog </v-icon>
            </v-btn>
          </template>
          <v-btn fab dark small color="green">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn fab dark small color="indigo">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn
            v-show="objectSelected"
            fab
            dark
            small
            color="red"
            @click="removeToken"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-btn
            fab
            dark
            small
            color="yellow darken-4"
            @click="drawMode = !drawMode"
          >
            <v-icon>{{
              drawMode ? "mdi-cursor-default-outline" : "mdi-brush"
            }}</v-icon>
          </v-btn>
          <v-btn
            fab
            :color="colorPickerColor"
            small
            @click="colorPickerDialog = true"
          >
            <v-icon> mdi-palette</v-icon></v-btn
          >
        </v-speed-dial>
      </div>
    </v-container>
    <v-footer
      style="z-index: 0"
      height="34"
      color="rgba(0,0,0,0.5)"
      fixed
      app
      padless
      outlined
    >
      <v-row class="py-0 mx-4">
        <v-col cols="4"></v-col>

        <v-col class="text-center text-caption pa-1 my-auto" cols="3">
          {{ new Date().getFullYear() }} — <strong>Roll Play Stage</strong>
        </v-col>
        <v-col
          class="text-center text-caption pa-1 font-weight-thin my-auto"
          style="border: 1px solid rgba(255, 255, 255, 0.2); opacity: 0.3"
          cols="3"
        >
          bg: {{ this.activeBackground.name }} [{{
            this.activeBackground.width + ", " + this.activeBackground.height
          }}] : {{ this.zoom }}x
        </v-col>
        <v-col
          @click="testFunction"
          cols="2"
          class="text-center text-caption pa-1 font-weight-thin my-auto"
          style="border: 1px solid rgba(255, 255, 255, 0.2); opacity: 0.3"
        >
          {{ mouse.x + ", " + mouse.y + "px" }}
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
              max="500"
              :color="colorPickerColor"
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
    <v-menu
      v-model="showObjectMenu"
      :position-x="menuX"
      :position-y="menuY"
      absolute
      offset-y
    >
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
    <v-snackbar
      transition="dialog-transition"
      text
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
  </div>
</template>

<script>
import { auth, db } from "../db";
import { fabric } from "fabric";
import _ from "lodash";

const lightSVG = require("../assets/svg/light.svg");
export default {
  name: "Canvas2",
  data: () => ({
    colors: ["blue", "red", "yellow", "orange", "green", "purple"],
    addMarker: false,
    drawMode: false,
    eraseMode: false,
    showToolTip: false,
    snackbar: {
      show: false,
      message: "",
    },
    colorPickerDialog: false,
    colorPickerColor: "#41A0E1",
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
    tokenRef: null,
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
    showActiveMenu: false,
    objectMenuItems: [
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
    ],
    clickData: {},
    isTokenAdded: false,
    tokenAdded: {},
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
    selected: {
      get() {
        return this.$store.state.selected;
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
      return this.user.uid === this.stage.uid;
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
    activeBackground() {
      this.detachListeners();
      this.attachListeners();
    },
    stage(val) {
      if (val) {
        this.reloadSession();
      }
    },
  },
  methods: {
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
        if (opt.target.selectable) {
          this.objectMenuItems[2].title = "Lock";
        } else {
          this.objectMenuItems[2].title = "Unlock";
        }
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
        top: Number(this.mouse.y - 12),
        left: Number(this.mouse.x),
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
        owner: this.stage.uid,
      };
      this.markerRef.push(marker).catch((error) => {
        console.log("marker: ", error.message);
      });
    },
    createLightSource() {
      fabric.loadSVGFromURL(this.lightSVG, (objects, options) => {
        var obj = fabric.util.groupSVGElements(objects, options);
        this.canvas.getHeight();
        obj.set({
          originX: "center",
          originY: "center",
          left: Number(this.mouse.x),
          top: Number(this.mouse.y),
          stage: this.stage.slug,
          owner: this.stage.uid,
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
      console.log("Objects", this.canvas._objects);
    },
    resetZoom() {
      let ratio = this.canvas.getHeight() / this.canvas.backgroundImage.height;
      this.canvas.setViewportTransform([ratio, 0, 0, ratio, 0, 0]);
      this.zoom = this.canvas.getZoom().toFixed(2);
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
      if (this.showAllNamesFlag) {
        this.hideAllNames();
        this.showAllNamesFlag = false;
      }
      var delta = opt.e.deltaY;
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
      }
      this.mouse.x = pointer.x.toFixed();
      this.mouse.y = pointer.y.toFixed();
    },
    throttle: _.throttle((func, opt, pointer) => {
      func(opt, pointer);
    }, 25),
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

      img.addEventListener("load", (ee) => {
        console.log(ee);
        // const width = ee.target.naturalWidth;
        // const height = ee.target.naturalHeight;
        // const name = "token_" + Object.keys(this.tokens).length + "";
        const name = "";
        const token = {
          stage: this.stage.slug,
          owner: this.stage.uid,
          name: name,
          url: url,
          angle: 0,
          scaleX: 1,
          scaleY: 1,
          hasAccess: "",
          originX: "center",
          originY: "center",
          race: "",
          notes: "",
          deletable: true,
          selectable: true,
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
        this.canvas.renderAll.bind(this.canvas);
        this.canvas.renderAll();
        this.resetZoom();
      });
    },
    addBg(e) {
      console.log("add bg method");
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
          stage: this.stage.slug,
          owner: this.stage.uid,
        };
        this.bgRef.push(background).catch((error) => {
          console.log("BG: ", error.message);
        });
      });
      img.src = url;
      this.bgDrag = false;
    },
    detachListeners() {
      if (this.tokenRef) this.tokenRef.off();
      if (this.markerRef) this.markerRef.off();
      if (this.drawingsRef) this.drawingsRef.off();
      if (this.lightRef) this.lightRef.off();
      this.canvas.clear();
    },
    attachListeners() {
      const slug = "stage/" + this.stage.slug;
      const bgSlug = slug + "/backgrounds/" + this.activeBackground.__id;
      this.tokenRef = db.database().ref(bgSlug + "/tokens");
      this.markerRef = db.database().ref(bgSlug + "/markers");
      this.drawingsRef = db.database().ref(bgSlug + "/drawings");
      this.lightRef = db.database().ref(bgSlug + "/light");

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
      });
      this.tokenRef.on("child_added", (snapshot) => {
        // console.log("CHILD_ADDED", snapshot.val().url);
        const data = snapshot.val();
        let hasAccess = false;
        if (this.user)
          if (data.hasAccess) hasAccess = data.hasAccess == this.user.uid;
        fabric.Image.fromURL(data.url, (img) => {
          // this.canvas.add(img).setActiveObject(img);
          this.canvas.add(img);
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
            selectable: (this.isOwner && data.selectable) || hasAccess,
            hasAccess: hasAccess,
            evented: data.evented,
            angle: data.angle,
            shadow: shadow,
            name: data.name,
            race: data.race,
            marker: false,
            notes: data.notes,
            showToolTip: false,
            toolTipX: 0,
            toolTipY: 0,
            originX: "center",
            originY: "center",
          });
          img.setCoords();
        });
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
            owner: this.stage.uid,
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
            owner: this.stage.uid,
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
            owner: this.stage.uid,
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
            owner: this.stage.uid,
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
      this.lightRef.on("child_changed", (snapshot) => {
        console.log(snapshot);
      });
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
        for (const i in this.canvas._objects) {
          if (this.canvas._objects[i].__id === id) {
            this.canvas._objects[i].set({
              name: data.name,
              race: data.race,
              notes: data.notes,
              hasAccess: data.hasAccess,
              deletable: data.deletable,
              selectable:
                (this.isOwner && data.selectable) ||
                (hasAccess && data.selectable),
              evented: data.evented,
            });
            this.canvas.renderAll();
            this.canvas._objects[i].animate("angle", data.angle, {});
            this.canvas._objects[i].animate("scaleX", data.scaleX, {});
            this.canvas._objects[i].animate("scaleY", data.scaleY, {});
            this.canvas._objects[i].animate("left", data.left, {});
            this.canvas._objects[i].animate("top", data.top, {
              onChange: this.canvas.renderAll.bind(this.canvas),
            });
            this.canvas.requestRenderAll();
            this.canvas._objects[i].setCoords();
          }
        }
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
          if (this.canvas._objects[i].__id === id) {
            this.canvas._objects[i].animate("left", data.left, {});
            this.canvas._objects[i].animate("top", data.top, {
              onChange: this.canvas.renderAll.bind(this.canvas),
            });
            this.canvas._objects[i].set({
              scaleX: data.scaleX,
              scaleY: data.scaleY,
              deletable: data.deletable,
              selectable: this.isOwner && data.selectable,
              evented: data.evented,
              globalCompositeOperation: data.globalCompositeOperation,
              angle: data.angle,
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
      if (this.sessionRef) this.sessionRef.off();
      if (this.bgRef) this.bgRef.off();
      const slug = "stage/" + this.stage.slug;
      this.sessionRef = db.database().ref(slug + "/session");
      this.bgRef = db.database().ref(slug + "/backgrounds");
      this.bgRef.on("value", (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        let backgrounds = [];
        Object.keys(data).forEach((key) => {
          let bgObject = { ...data[key] };
          bgObject.__id = key;
          backgrounds.push(bgObject);
        });
        this.backgrounds = backgrounds;
      });
      this.sessionRef
        .child(1)
        .get()
        .then((result) => {
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
    this.headerHeight = this.$refs.appBar;
    this.canvas = new fabric.Canvas(ref, {
      fireRightClick: true, // <-- enable firing of right click events
      fireMiddleClick: true, // <-- enable firing of middle click events
      stopContextMenu: true, // <--  prevent context menu from showing
    });
    this.reloadSession();
    const fullWidth = window.innerWidth;
    const fullHeight = window.innerHeight - 85;
    this.canvas.setDimensions({ width: fullWidth, height: fullHeight });
    window.addEventListener("resize", () => {
      const fullWidth = window.innerWidth;
      const fullHeight = window.innerHeight - 85;
      this.canvas.setDimensions({ width: fullWidth, height: fullHeight });
    });
    window.addEventListener("keyup", (e) => {
      if (this.editTokenDialog) return;
      if (e.key == "Escape") {
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
      }
      if (e.key == "Delete") {
        this.removeToken();
      }
      if (e.key == "b") {
        this.drawMode = !this.drawMode;
      }
      if (e.key == "c") {
        this.colorPickerDialog = !this.colorPickerDialog;
      }
      if (e.key == "a") {
        // select alla
      }
      if (e.key == "l") {
        this.createLightSource();
      }
      if (e.key == "k") {
        this.editLightMode();
      }
    });
    this.canvas.on({
      "mouse:down": (opt) => {
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
      },
      "touch:drag": (opt) => {
        console.log("TOUCH, DRAG", opt);
      },
      "mouse:move": (opt) => {
        const pointer = this.canvas.getPointer();
        this.throttle(this.canvasMouseMove, opt, pointer);
      },
      "mouse:up": (opt) => {
        if (this.drawing) {
          console.log("stop drawing");
          this.drawing = false;
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
        if (selection.type == "activeSelection") return;
        if (
          e.target.type !== "path" &&
          e.target.type !== "circle" &&
          e.target.type !== "group"
        ) {
          e.target.set({
            scaleX: e.target.scaleX / 1.05,
            scaleY: e.target.scaleY / 1.05,
            showToolTip: false,
          });
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
      "selection:updated": () => {
        console.log("object selection updated");
        this.objectSelected = true;
        this.showToolTip = false;
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
          e.target.set({
            scaleX: e.target.scaleX * 1.05,
            scaleY: e.target.scaleY * 1.05,
          });
        }
        this.canvas.renderAll();
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
          e.target.set({
            scaleX: e.target.scaleX / 1.05,
            scaleY: e.target.scaleY / 1.05,
          });
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
        drawing.owner = this.stage.uid;
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
          } else objects.push(e.target);
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
  border: 1px solid blue;
  position: absolute !important;
  top: 20px;
  left: 20px;
  background-color: red;
}
.tooltips {
  margin: 0 auto;
  text-align: center;
  vertical-align: middle;
  font: caption;
}
</style>
