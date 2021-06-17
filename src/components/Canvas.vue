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
            outlined
            class="minimap"
            style="position: absolute; top: 10px; left: 10px"
          >
            <canvas ref="mini" width="80" height="80"></canvas>
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
            <v-btn v-model="fab" color="blue darken-2" dark fab>
              <v-icon v-if="fab">
                mdi-close
              </v-icon>
              <v-icon v-else>
                mdi-cog
              </v-icon>
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
            v-show="drawMode"
            small
            @click="colorPickerDialog = true"
          ></v-btn>
        </v-speed-dial>
      </div>
      <!-- <v-container class="ma-0 pa-0">
        <v-row dense>
          <v-col>
            <v-btn
              :depressed="addMarker"
              block
              class="ml-1 mr-1"
              :color="markerColor"
              dense
              @click="setMarkerColor"
              >Add Marker</v-btn
            >
          </v-col>
          <v-col>
            <v-select
              v-show="addMarker"
              block
              class="ml-1 mr-1"
              dense
              :items="colors"
              v-model="markerColor"
              outlined
              width="100"
              label="Marker Color"
            ></v-select>
          </v-col>
          <v-col></v-col>
          <v-spacer></v-spacer>
        </v-row>
      </v-container> -->
    </v-container>
    <v-footer
      style="z-index: 0;"
      height="34"
      color="rgba(0,0,0,0.5)"
      fixed
      app
      padless
      outlined
    >
      <v-row class="py-0 mx-4">
        <v-col cols="4"></v-col>

        <v-col class="text-center text-caption pa-1 my-auto" cols="4">
          {{ new Date().getFullYear() }} — <strong>Roll Play Stage</strong>
        </v-col>
        <v-col></v-col>
        <v-col
          class="text-center text-caption pa-1 font-weight-thin my-auto"
          style="border: 1px solid rgba(255,255,255, 0.2); opacity: 0.3;"
          cols="2"
        >
          bg: {{ this.activeBackground.name }} [{{
            this.activeBackground.width + ", " + this.activeBackground.height
          }}] : {{ this.zoom }}x
        </v-col>
        <v-col
          cols="1"
          class="text-center text-caption pa-1 font-weight-thin my-auto"
          style="border: 1px solid rgba(255,255,255, 0.2); opacity: 0.3;"
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
            <div class="text-caption text-center">
              Line Size
            </div>
            <v-slider
              min="1"
              max="500"
              :color="colorPickerColor"
              thumb-color="grey darken-2"
              thumb-label
              hide-details
              class="mx-10 "
              v-model="strokeWidth"
              hint="Line Size"
            ></v-slider>
          </div>
        </v-sheet>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import db from "../db";
import { fabric } from "fabric";
export default {
  name: "Canvas",
  data: () => ({
    colors: ["blue", "red", "yellow", "orange", "green", "purple"],
    addMarker: false,
    drawMode: false,
    eraseMode: false,
    colorPickerDialog: false,
    colorPickerColor: "rgba(0,0,0,1)",
    strokeWidth: 1,
    drawing: false,
    erasing: false,
    toolTip: "Tool Tip",
    markerColor: null,
    mouse: {
      x: 0,
      y: 0,
    },
    zoom: 1,
    bgDrag: false,
    tokenRef: {},
    objectSelected: false,
    tokens: {},
    canvas: {},
    minimap: {},
    changing: false,
    drawingMode: "add",
    pencilWidth: 25,
    fillColor: "rgba(255,0,0,.5)",
    fab: false,
    tabs: null,
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
  },
  methods: {
    setMarkerColor() {
      if (this.addMarker) {
        this.markerColor = "dark";
        this.addMarker = false;
      } else {
        this.addMarker = true;
        this.markerColor = "orange";
      }
    },
    createMarker(e) {
      const pointer = this.canvas.getPointer();
      console.log(e);
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
        top: pointer.y - 12,
        left: pointer.x,
        width: 25,
        angle: 180,
        height: 25,
        fill: this.markerColor,
        stroke: "rgba(0,0,0,0.6)",
        strokeWidth: 3,
        shadow: shadow,
        opacity: 0.8,
        deletable: true,
        selectable: true,
        evented: true,
        name: "",
        notes: "",
      };
      console.log("createMarker()");
      this.markerRef.push(marker);
    },
    testMethod() {
      // var text = new fabric.Textbox("Text", {
      //   width: 100,
      //   top: 100,
      //   left: 100,
      //   cursorWidth: 0,
      // });
      // this.canvas.add(text);
      console.log("Objects", this.canvas._objects[0]);

      // console.log("ViewportTransform", this.canvas.viewportTransform);

      // console.log("Zoom", this.canvas.getZoom());
    },
    resetZoom() {
      let ratio = this.canvas.getHeight() / this.canvas.backgroundImage.height;
      this.canvas.setViewportTransform([ratio, 0, 0, ratio, 0, 0]);
      this.zoom = this.canvas.getZoom().toFixed(2);
    },
    removeToken() {
      const selection = this.canvas.getActiveObject();
      if (!selection) return;
      let selectedTokens = [];
      if (selection.type == "activeSelection") {
        selectedTokens = selection._objects;
      } else selectedTokens.push(selection);
      selectedTokens.forEach((token) => {
        if (token.deletable) {
          if (token.type === "path") {
            const drawingFB = this.drawingsRef.child(token.__id);
            drawingFB.remove();
          } else if (token.marker) {
            const markerFB = this.markerRef.child(token.__id);
            markerFB.remove();
          } else {
            const tokenFB = this.tokenRef.child(token.__id);
            tokenFB.remove();
          }
        }
      });
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    },
    getTokenFromId(id) {
      return this.canvas.getObjects().filter((obj) => obj.__id === id)[0];
    },
    addTokenDrag(e) {
      if (this.bgDrag) {
        this.addBg(e);
        return;
      }
      const url = e.dataTransfer.getData("Text");
      var img = new Image();
      img.addEventListener("load", (ee) => {
        const width = ee.target.naturalWidth;
        const height = ee.target.naturalHeight;
        const name = "token_" + Object.keys(this.tokens).length + "";
        const token = {
          name: name,
          url: url,
          top: e.clientY - height / 2,
          left: e.clientX - width / 2,
          angle: 0,
          scaleX: 1,
          scaleY: 1,
          race: "",
          notes: "",
          deletable: true,
          selectable: true,
          evented: true,
        };
        this.tokenRef.push(token);
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
        };
        this.bgRef.push(background);
      });
      img.src = url;
      this.bgDrag = false;
    },
  },
  mounted() {
    const ref = this.$refs.can;
    const mini = this.$refs.mini;
    this.canvas = new fabric.Canvas(ref, {
      fireRightClick: true, // <-- enable firing of right click events
      fireMiddleClick: true, // <-- enable firing of middle click events
      stopContextMenu: true, // <--  prevent context menu from showing
    });
    const fullWidth = window.innerWidth;
    const fullHeight = window.innerHeight - 85;
    this.canvas.setDimensions({ width: fullWidth, height: fullHeight });
    this.minimap = new fabric.Canvas(mini, {
      // http://fabricjs.com/build-minimap
      // http://fabricjs.com/build-minimap
      // http://fabricjs.com/build-minimap
      selection: false,
    });
    this.tokenRef = db.database().ref("tokens");
    this.bgRef = db.database().ref("backgrounds");
    this.markerRef = db.database().ref("markers");
    this.sessionRef = db.database().ref("session");
    this.drawingsRef = db.database().ref("drawings");

    window.addEventListener("resize", () => {
      const fullWidth = window.innerWidth;
      const fullHeight = window.innerHeight - 85;
      this.canvas.setDimensions({ width: fullWidth, height: fullHeight });
    });
    window.addEventListener("keyup", (e) => {
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
        // select all
      }
    });
    this.canvas.on("mouse:down", (opt) => {
      var evt = opt.e;
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
    });
    this.canvas.on("mouse:move", (opt) => {
      if (this.canvas.isDragging) {
        var vpt = this.canvas.viewportTransform;
        console.log("dragging");
        var e = opt.e;
        vpt[4] += e.clientX - this.canvas.lastPosX;
        vpt[5] += e.clientY - this.canvas.lastPosY;
        this.canvas.requestRenderAll();
        this.canvas.lastPosX = e.clientX;
        this.canvas.lastPosY = e.clientY;
      }
      const pointer = this.canvas.getPointer();
      this.mouse.x = pointer.x.toFixed();
      this.mouse.y = pointer.y.toFixed();
    });
    var toolTip = new fabric.Text(this.toolTip, {
      fontSize: 15,
      originX: "center",
      originY: "center",
      fill: "white",
      backgroundColor: "black",
      opacity: 0.6,
      visible: false,
    });
    this.canvas.add(toolTip);
    this.canvas.renderAll();
    this.canvas.on("mouse:up", (opt) => {
      if (this.drawing) {
        console.log("stop drawing");
        this.drawing = false;
      }
      if (opt.target) {
        const selection = opt.target;
        if (!selection) return;
        if (selection.type == "activeSelection") return;
        this.selected = selection.toJSON([
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
      this.canvas.selection = true;
      if (this.addMarker) {
        this.createMarker(opt);
        this.setMarkerColor();
      }
    });

    // ---------- SCROLL ZOOM ----------
    this.canvas.on("mouse:wheel", (opt) => {
      var delta = opt.e.deltaY;
      var zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      this.zoom = zoom.toFixed(2);
      if (zoom > 20) zoom = 20;
      if (zoom < 0.1) zoom = 0.1;
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
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
    });
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
      if (!this.activeBackground) {
        this.activeBackground = backgrounds[this.backgrounds.length - 1];
      }
    });
    this.tokenRef.on("child_added", (snapshot) => {
      console.log("CHILD_ADDED", snapshot.val().url);
      const data = snapshot.val();
      fabric.Image.fromURL(data.url, (img) => {
        // this.canvas.add(img).setActiveObject(img);
        this.canvas.add(img);
        var shadow = new fabric.Shadow({
          color: "black",
          blur: 50,
          offsetX: 5,
          offsetY: 5,
          opacity: 0.5,
        });
        img.set({
          __id: snapshot.key,
          top: data.top,
          left: data.left,
          scaleX: data.scaleX,
          scaleY: data.scaleY,
          deletable: data.deletable,
          selectable: data.selectable,
          evented: data.evented,
          angle: data.angle,
          shadow: shadow,
          name: data.name,
          race: data.race,
          marker: false,
          notes: data.notes,
          originX: "center",
          originY: "center",
        });
        img.setCoords();
      });
    });
    this.markerRef.on("child_added", (snapshot) => {
      console.log("Marker_ADDED", snapshot.val());
      const data = snapshot.val();
      var triangle = new fabric.Triangle(data);
      triangle.set({
        __id: snapshot.key,
        marker: true,
        name: data.name,
        deletable: data.deletable,
        selectable: data.selectable,
        evented: data.evented,
        notes: data.notes,
      });
      // this.canvas.add(triangle).setActiveObject(triangle);
      this.canvas.add(triangle);
      triangle.setCoords();
      this.canvas.renderAll();
    });
    this.drawingsRef.on("child_added", (snapshot) => {
      console.log("Drawing Added", snapshot.val());
      const data = snapshot.val();
      var path = new fabric.Path(data.path, data);
      path.set({
        __id: snapshot.key,
        deletable: data.deletable,
        selectable: data.selectable,
        evented: data.evented,
        name: data.name,
        notes: data.notes,
      });
      this.canvas.add(path);
    });
    this.canvas.on("selection:created", (e) => {
      console.log("object selected");
      this.objectSelected = true;
      const selection = this.canvas.getActiveObject();
      if (!selection) return;
      if (selection.type == "activeSelection") return;
      if (e.target.type !== "path") {
        e.target.set({
          scaleX: e.target.scaleX / 1.1,
          scaleY: e.target.scaleY / 1.1,
        });
      }
      this.selected = selection.toJSON([
        "__id",
        "deletable",
        "selectable",
        "evented",
        "name",
        "race",
        "notes",
        "marker",
      ]);
      toolTip.set({
        visible: false,
      });
      this.canvas.renderAll();
    });
    this.canvas.on("selection:cleared", () => {
      console.log("object deselected");
      this.objectSelected = false;
      this.selected = false;
    });
    this.canvas.on("selection:updated", () => {
      console.log("object selection updated");
      this.objectSelected = true;
      toolTip.set({
        visible: false,
      });
      this.canvas.requestRenderAll();
    });
    this.canvas.on("object:moving", () => {
      toolTip.set({
        visible: false,
      });
      this.canvas.requestRenderAll();
      this.changing = true;
    });
    this.canvas.on("object:rotating", () => {
      toolTip.set({
        visible: false,
      });
      this.canvas.requestRenderAll();
      this.changing = true;
    });
    this.canvas.on("object:scaling", () => {
      toolTip.set({
        visible: false,
      });
      this.canvas.requestRenderAll();
      this.changing = true;
    });
    this.canvas.on("mouse:over", (e) => {
      if (e.target == null) return;
      var topOffset =
        e.target.top - (e.target.height * e.target.scaleY) / 2 - 20;
      if (e.target.name) {
        toolTip.set({
          text: e.target.name,
          visible: true,
          left: e.target.left,
          top: topOffset,
        });
      }
      if (this.objectSelected) return;
      if (this.canvas.isDragging) return;
      if (e.target.type !== "path") {
        e.target.set({
          scaleX: e.target.scaleX * 1.1,
          scaleY: e.target.scaleY * 1.1,
        });
      }
      this.canvas.renderAll();
    });
    this.canvas.on("mouse:out", (e) => {
      toolTip.set({
        visible: false,
      });
      this.canvas.renderAll();
      if (e.target == null) return;
      if (this.objectSelected) return;
      if (this.canvas.isDragging) return;
      if (e.target.type !== "path") {
        e.target.set({
          scaleX: e.target.scaleX / 1.1,
          scaleY: e.target.scaleY / 1.1,
        });
      }
      toolTip.set({
        visible: false,
      });
      this.canvas.renderAll();
    });
    this.canvas.on("path:created", (e) => {
      var newDrawing = e.path;
      this.canvas.remove(newDrawing);
      if (newDrawing.path.length < 4) return;
      newDrawing.set({
        originX: "center",
        originY: "center",
      });
      const offsetX = (newDrawing.width + this.strokeWidth) / 2;
      const offsetY = (newDrawing.height + this.strokeWidth) / 2;
      console.log(offsetX, offsetY, newDrawing.top, newDrawing.left);
      let drawing = newDrawing.toJSON();
      drawing.name = "";
      drawing.notes = "";
      drawing.deletable = true;
      drawing.selectable = true;
      drawing.evented = true;
      drawing.left = drawing.left + offsetX;
      drawing.top = drawing.top + offsetY;
      drawing.fill = "transparent";
      this.drawingsRef.push(drawing);
    });
    this.canvas.on("object:modified", (e) => {
      if (!this.changing) return;
      if (e.target.type === "textbox") return;
      console.log("im here now again");
      var objects = [];
      if (e.target._objects != undefined) {
        const brokenObjects = this.canvas.getActiveObjects();
        const canvasJSON = this.canvas.toJSON([
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
          console.log("drawing update");
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
          drawing.update(updates);
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
        } else {
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
      this.changing = false;
    });
    this.tokenRef.on("child_removed", (snapshot) => {
      console.log("CHILD_REMOVED");
      const id = snapshot.key;
      console.log(id);
      const token = this.getTokenFromId(id);
      this.canvas.remove(token);
    });
    this.markerRef.on("child_removed", (snapshot) => {
      console.log("CHILD_REMOVED");
      const id = snapshot.key;
      console.log(id);
      const token = this.getTokenFromId(id);
      this.canvas.remove(token);
    });
    this.drawingsRef.on("child_removed", (snapshot) => {
      console.log("drawing removed");
      const id = snapshot.key;
      console.log(id);
      const token = this.getTokenFromId(id);
      this.canvas.remove(token);
    });
    this.sessionRef.on("child_changed", (snapshot) => {
      this.setBG(snapshot.val().activeBackground.url);
      this.activeBackground = snapshot.val().activeBackground;
    });
    this.sessionRef.on("child_added", (snapshot) => {
      this.setBG(snapshot.val().activeBackground.url);
      this.activeBackground = snapshot.val().activeBackground;
    });
    this.tokenRef.on("child_changed", (snapshot) => {
      if (this.changing) return;
      // this.canvas.discardActiveObject();
      const data = snapshot.val();
      const id = snapshot.key;
      for (const i in this.canvas._objects) {
        if (this.canvas._objects[i].__id === id) {
          this.canvas._objects[i].set({
            name: data.name,
            race: data.race,
            notes: data.notes,
            deletable: data.deletable,
            selectable: data.selectable,
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
            selectable: data.selectable,
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
            selectable: data.selectable,
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
</style>
