<template>
  <v-container fluid class="pa-0">
    <div
      v-cloak
      @drop.prevent="addTokenDrag"
      @dragover.prevent
      v-on:dblclick="resetZoom"
    >
      <v-card height="100%">
        <canvas
          ref="can"
          width="640"
          height="480"
          style="border: 1px solid black"
        ></canvas>
        <div v-cloak @drop.prevent="bgDrag = true" @dragover.prevent>
          <v-card
            outlined
            class="minimap"
            style="position: absolute; top: 10px; left: 10px"
          >
            <canvas ref="mini" width="80" height="80"></canvas>
          </v-card>
        </div>
      </v-card>
    </div>
    <v-btn dense :disabled="!objectSelected" @click="removeToken">remove</v-btn>

    <v-btn dense @click="testMethod">TEST BUTTON</v-btn>

    <!-- <div v-for="(token, index) in tokens" :key="token.__id">
      <br />{{ index }}. {{ token.name }}
    </div> -->
  </v-container>
</template>

<script>
import db from "../db";
import { fabric } from "fabric";
export default {
  name: "Canvas",
  data: () => ({
    bgDrag: false,
    tokenRef: {},
    objectSelected: false,
    tokens: {},
    canvas: {},
    minimap: {},
    changing: false,
    backgrounds: {},
    bgSelected: 0,
  }),
  computed: {
    selected: {
      get() {
        return this.$store.state.selected;
      },
      set(newSelection) {
        return this.$store.dispatch("setSelected", newSelection);
      },
    },
  },
  methods: {
    testMethod() {
      // var text = new fabric.Textbox("Text", {
      //   width: 100,
      //   top: 100,
      //   left: 100,
      //   cursorWidth: 0,
      // });
      // this.canvas.add(text);
      console.log(this.canvas.getActiveObject());
    },
    resetZoom() {
      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      console.log("resetZoom");
    },
    removeToken() {
      const selection = this.canvas.getActiveObject();
      if (!selection) return;
      let selectedTokens = [];
      if (selection.type == "activeSelection") {
        selectedTokens = selection._objects;
      } else selectedTokens.push(selection);
      selectedTokens.forEach((token) => {
        const tokenFB = this.tokenRef.child(token.__id);
        tokenFB.remove();
      });
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
        };
        this.tokenRef.push(token);
      });
      img.src = url;
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
    const fullHeight = window.innerHeight - 100;
    this.canvas.setDimensions({ width: fullWidth, height: fullHeight });
    this.minimap = new fabric.Canvas(mini, {
      // http://fabricjs.com/build-minimap
      // http://fabricjs.com/build-minimap
      // http://fabricjs.com/build-minimap
      selection: false,
    });
    this.tokenRef = db.database().ref("tokens");
    this.bgRef = db.database().ref("backgrounds");

    window.addEventListener("resize", () => {
      const fullWidth = window.innerWidth;
      const fullHeight = window.innerHeight - 100;
      this.canvas.setDimensions({ width: fullWidth, height: fullHeight });
    });
    this.canvas.on("mouse:down", (opt) => {
      var evt = opt.e;
      if (evt.button === 2 || evt.altKey === true) {
        this.canvas.isDragging = true;
        this.canvas.selection = false;
        this.canvas.lastPosX = evt.clientX;
        this.canvas.lastPosY = evt.clientY;
      }
    });
    this.canvas.on("mouse:move", (opt) => {
      if (this.canvas.isDragging) {
        var e = opt.e;
        var vpt = this.canvas.viewportTransform;
        vpt[4] += e.clientX - this.canvas.lastPosX;
        vpt[5] += e.clientY - this.canvas.lastPosY;
        this.canvas.requestRenderAll();
        this.canvas.lastPosX = e.clientX;
        this.canvas.lastPosY = e.clientY;
      }
    });
    this.canvas.on("mouse:up", () => {
      // on mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      this.canvas.setViewportTransform(this.canvas.viewportTransform);
      this.canvas.isDragging = false;
      this.canvas.selection = true;
    });

    // ---------- SCROLL ZOOM ----------
    this.canvas.on("mouse:wheel", (opt) => {
      var delta = opt.e.deltaY;
      var zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
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
      this.bgSelected = this.backgrounds.length - 1;
      fabric.Image.fromURL(this.backgrounds[this.bgSelected].url, (img) => {
        this.canvas.setBackgroundImage(img);
        img.scaleToHeight(this.canvas.getHeight());
        this.canvas.renderAll.bind(this.canvas);
        // img.scaleToWidth(this.canvas.getWidth());
      });
    });
    // this.bgRef.on("child_added", (snapshot) => {
    //   const data = snapshot.val();
    //   console.log("BG ADDED", data.url);
    //   fabric.Image.fromURL(data.url, (img) => {
    //     this.canvas.setBackgroundImage(
    //       img,
    //       this.canvas.renderAll.bind(this.canvas)
    //     );
    //   });
    // });

    this.tokenRef.on("child_added", (snapshot) => {
      console.log("CHILD_ADDED", snapshot.val().url);
      const data = snapshot.val();
      fabric.Image.fromURL(data.url, (img) => {
        this.canvas.add(img).setActiveObject(img);
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
          angle: data.angle,
          shadow: shadow,
          name: data.name,
          race: data.race,
          notes: data.notes,
        });
        img.setCoords();
      });
    });
    this.canvas.on("selection:created", (e) => {
      console.log("object selected");
      this.objectSelected = true;
      const selection = this.canvas.getActiveObject();
      if (!selection) return;
      if (selection.type == "activeSelection") return;
      this.selected = selection.toJSON(["__id", "name", "race", "notes"]);
      e.target.set({
        scaleX: e.target.scaleX / 1.1,
        scaleY: e.target.scaleX / 1.1,
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
      const selection = this.canvas.getActiveObject();
      if (!selection) return;
      if (selection.type == "activeSelection") return;
      this.selected = selection.toJSON(["__id", "name", "race", "notes"]);
    });
    this.canvas.on("object:moving", () => {
      this.changing = true;
    });
    this.canvas.on("object:rotating", () => {
      this.changing = true;
    });
    this.canvas.on("object:scaling", () => {
      this.changing = true;
    });
    this.canvas.on("mouse:over", (e) => {
      if (e.target == null) return;
      if (this.objectSelected) return;
      if (this.canvas.isDragging) return;
      e.target.set({
        scaleX: e.target.scaleX * 1.1,
        scaleY: e.target.scaleX * 1.1,
      });
      this.canvas.renderAll();
    });
    this.canvas.on("mouse:out", (e) => {
      if (e.target == null) return;
      if (this.objectSelected) return;
      if (this.canvas.isDragging) return;
      e.target.set({
        scaleX: e.target.scaleX / 1.1,
        scaleY: e.target.scaleX / 1.1,
      });
      this.canvas.renderAll();
    });
    this.canvas.on("object:modified", (e) => {
      if (!this.changing) return;
      if (e.target.type === "textbox") return;
      console.log("im here now again");
      var objects = [];
      if (e.target._objects != undefined) {
        const brokenObjects = this.canvas.getActiveObjects();
        const canvasJSON = this.canvas.toJSON(["__id", "name", "race", "notes"])
          .objects;
        brokenObjects.forEach((broke) => {
          canvasJSON.forEach((json) => {
            if (broke.__id === json.__id) objects.push(json);
          });
        });
      } else objects.push(e.target);
      objects.forEach((object) => {
        const token = this.tokenRef.child(object.__id);
        const updates = {
          top: object.top,
          left: object.left,
          scaleX: object.scaleX,
          scaleY: object.scaleY,
          angle: object.angle,
        };
        token.update(updates);
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
    this.tokenRef.on("child_changed", (snapshot) => {
      if (this.changing) return;
      this.canvas.discardActiveObject();
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
            angle: data.angle,
            name: data.name,
            race: data.race,
            notes: data.notes,
          });
          this.canvas._objects[i].setCoords();
          this.canvas.requestRenderAll();
        }
      }
    });
  },
};
</script>
<style scoped>
.minimap {
  border: 1px solid blue;
  position: absolute !important;
  top: 20px;
  left: 20px;
  background-color: red;
}
</style>
