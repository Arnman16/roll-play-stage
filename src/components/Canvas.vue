<template>
  <v-container>
    <div v-cloak @drop.prevent="addTokenDrag" @dragover.prevent>
      <v-card width="640">
        <canvas
          ref="can"
          width="640"
          height="480"
          style="border: 1px solid black"
        ></canvas>
      </v-card>
    </div>
    <v-btn :disabled="!objectSelected" @click="removeToken">remove</v-btn>
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
    tokenRef: {},
    objectSelected: false,
    tokens: {},
    canvas: {},
    changing: false,
  }),
  methods: {
    addToken() {
      const token = {
        name: "Goblin",
        url: "http://google.com/",
      };
      this.tokenRef.push(token);
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
      const url = e.dataTransfer.getData("Text");
      var img = new Image();
      img.addEventListener("load", (ee) => {
        const width = ee.target.naturalWidth;
        const height = ee.target.naturalHeight;
        const name = "token_" + Object.keys(this.tokens).length;
        const token = {
          name: name,
          url: url,
          top: e.clientY - (height/2),
          left: e.clientX - (width/2),
          angle: 0,
          scaleX: 1,
          scaleY: 1,
        };
        this.tokenRef.push(token);
      });
      img.src = url;
    },
  },
  mounted() {
    const ref = this.$refs.can;
    this.canvas = new fabric.Canvas(ref, {
      fireRightClick: true, // <-- enable firing of right click events
      fireMiddleClick: true, // <-- enable firing of middle click events
      stopContextMenu: true, // <--  prevent context menu from showing
    });
    this.tokenRef = db.database().ref("tokens");

    this.tokenRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if(!data) return;
      let tokens = [];
      Object.keys(data).forEach((key) => {
        tokens.push({
          __id: key,
          name: data[key].name,
          url: data[key].url,
        });
      });
      this.tokens = tokens;
    });
    this.tokenRef.on("child_added", (snapshot) => {
      console.log("CHILD_ADDED", snapshot.val().url);
      const data = snapshot.val();
      fabric.Image.fromURL(data.url, (img) => {
        this.canvas.add(img).setActiveObject(img);
        img.set({
          __id: snapshot.key,
          top: data.top,
          left: data.left,
          scaleX: data.scaleX,
          scaleY: data.scaleY,
          angle: data.angle,
        });
        img.setCoords();
      });
    });
    this.canvas.on("selection:created", () => {
      console.log("object selected");
      this.objectSelected = true;
    });
    this.canvas.on("selection:cleared", () => {
      console.log("object deselected");
      this.objectSelected = false;
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

    this.canvas.on("object:modified", (e) => {
      if (!this.changing) return;
      console.log("im here now again");
      var objects = [];
      if (e.target._objects != undefined) {
        const brokenObjects = this.canvas.getActiveObjects();
        const canvasJSON = this.canvas.toJSON(["__id"]).objects;
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
        console.log(updates);
        token.update(updates);
      });
      this.changing = false;
    });
    this.tokenRef.on("child_removed", (snapshot) => {
      console.log("CHILD_REMOVED");
      const id = snapshot.key;
      console.log(id)
      const token = this.getTokenFromId(id);
      this.canvas.remove(token);
    });
    this.tokenRef.on("child_changed", (snapshot) => {
      if (this.changing) return;
      // console.log(snapshot.getRef());
      // var activeKey = "";
      // if (this.canvas.getActiveObject() != undefined)
      //   activeKey = this.canvas.getActiveObject().__id;
      // if (snapshot.key === activeKey) console.log("CALLBACK HELL");
      // console.log("CHILD_CHANGED", snapshot.val());
      this.canvas.discardActiveObject();
      const data = snapshot.val();
      const id = snapshot.key;
      for (const i in this.canvas._objects) {
        if (this.canvas._objects[i].__id === id) {
          // this.canvas._objects[i].animate("scaleX", data.scaleX, {
          // });
          // this.canvas._objects[i].animate("scaleY", data.scaleY, {
          // });
          this.canvas._objects[i].animate("left", data.left, {
            // onChange: this.canvas.renderAll.bind(this.canvas),
          });
          this.canvas._objects[i].animate("top", data.top, {
            onChange: this.canvas.renderAll.bind(this.canvas),
          });
          this.canvas._objects[i].set({
            scaleX: data.scaleX,
            scaleY: data.scaleY,
            angle: data.angle,
          });
          this.canvas._objects[i].setCoords();
          this.canvas.requestRenderAll();
        }
      }
    });
  },
};
</script>
