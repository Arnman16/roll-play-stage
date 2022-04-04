<template>
  <v-container
    class="align-start pa-0 ma-0 ba-0"
    fill-height
    style="display: block"
  >
    <v-container fluid class="align-start chat-area" id="chat-area">
      <div style="height: 100px; opacity: 0.15" class="text-center">
        End of chat
      </div>
      <v-row v-for="(msg, index) in messages" :key="index">
        <v-col v-if="msg.diceRoll">
          <v-card flat tile outlined color="black">
            <v-card-title>Dice Roll - {{ msg.name }}</v-card-title>
            <v-card-text class="mx-auto pa-1 text-block">
              {{ msg.message }}
            </v-card-text>
          </v-card>
        </v-col>
        <v-col v-else-if="msg.location">
          <v-card
            @click="setChatPin(msg.message)"
            flat
            tile
            :color="msg.message.color"
          >
            <v-card-text
              :class="`text-center pa-0 ${getTextColor(msg.message.color)}`"
            >
              {{ `${msg.name} dropped a pin` }}
            </v-card-text>
          </v-card>
        </v-col>
        <v-col
          v-else
          cols="12"
          :class="
            msg.uid == user.uid
              ? 'text-right text-caption py-0 px-2 font-weight-thin my-auto'
              : 'text-left text-caption py-0 px-2 font-weight-thin my-auto'
          "
          :style="
            msg.uid == stage.owner
              ? 'opacity: 0.5; color: yellow;'
              : 'opacity: 0.5'
          "
        >
          {{ msg.name }}:
        </v-col>
        <v-col
          v-if="!msg.diceRoll && !msg.location"
          :class="
            msg.uid == user.uid
              ? 'pl-2 pr-0 pt-0 pb-1 ma-0 ba-0'
              : 'pl-0 pr-2 pt-0 pb-1 ma-0 ba-0'
          "
        >
          <v-card
            flat
            :color="msg.uid == user.uid ? '#121212' : 'rgba(42,47,49,0.7)'"
            ><v-container class="chat-bubble">
              <v-card-text class="mx-auto py-1 text-block px-2">
                {{ msg.message }}
              </v-card-text>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
      <div id="chatEnd"></div>
    </v-container>
    <v-textarea
      solo
      v-model="textArea"
      flat
      outlined
      fill-width
      hide-details
      rows="3"
      background-color="rgba(29, 29, 32, 0.7)"
      color="rgba(255, 255, 255, 0.2)"
      class="px-2 pt-2 pb-0 text-area"
      v-on:keyup.enter="sendMessage"
    ></v-textarea>
  </v-container>
</template>

<script>
import { db, firebase, auth } from "../db";
import { mapGetters } from "vuex";
import { debounce } from "lodash";
export default {
  name: "Chat",
  computed: {
    chatPin: {
      get() {
        return this.$store.getters.chatPin;
      },
      set(value) {
        return this.$store.dispatch("setChatPin", value);
      },
    },
    ...mapGetters({
      user: "user",
      stage: "stage",
    }),
  },
  watch: {
    stage(stageVal) {
      if (stageVal) {
        this.setChatWatchers();
      }
    },
  },
  data() {
    return {
      messages: [],
      scrollToNewMsg: true,
      chatRef: null,
      textArea: "",
      options: {
        duration: 50,
        container: "#chat-area",
      },
    };
  },
  methods: {
    getTextColor(bgColor) {
      let lightColor = "white--text";
      let darkColor = "black--text";
      var color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
      var r = parseInt(color.substring(0, 2), 16); // hexToR
      var g = parseInt(color.substring(2, 4), 16); // hexToG
      var b = parseInt(color.substring(4, 6), 16); // hexToB
      var uicolors = [r / 255, g / 255, b / 255];
      var c = uicolors.map((col) => {
        if (col <= 0.03928) {
          return col / 12.92;
        }
        return Math.pow((col + 0.055) / 1.055, 2.4);
      });
      var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
      return L > 0.179 ? darkColor : lightColor;
    },
    setChatPin(mouse) {
      this.chatPin = null;
      console.log(mouse);
      this.chatPin = mouse;
    },
    scrollToBottom() {
      this.$vuetify.goTo("#chatEnd", this.options);
    },
    debounce: debounce((func) => {
      func();
    }, 25),
    sendMessage(e) {
      if (this.textArea.replace("\n", "") < 2) return;
      if (e.ctrlKey) {
        this.textArea = this.textArea + "\n";
        return;
      }
      if (!auth.currentUser) return;
      let text = this.textArea.replace(/^\n|\n$/g, "");
      this.textArea = "";
      let message = {
        message: text,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        uid: this.user.uid,
        name: this.user.displayName.split(" ")[0],
      };
      this.chatRef.push(message, (error) => {
        if (error) {
          console.log("chat tx error", error);
        }
      });
    },
    setChatRef() {
      const path = `users/${this.stage.owner}/stages/${this.stage.slug}`;
      const chatPath = `${path}/chat`;
      if (this.chatRef) this.chatRef.off();
      this.chatRef = db.database().ref(chatPath);
    },
    setChatWatchers() {
      this.setChatRef();
      if (auth.currentUser) {
        this.chatRef.on("child_added", (snapshot) => {
          let val = snapshot.val();
          val.key = snapshot.key;
          this.messages.push(val);
          if (this.scrollToNewMsg) {
            this.debounce(this.scrollToBottom);
          }
        });
      }
    },
  },
  mounted() {
    this.setChatWatchers();
    this.$vuetify.goTo("#chatEnd", this.options);
  },
  updated() {},
};
</script>

<style>
.v-navigation-drawer__content {
  overflow-y: hidden !important;
}
.chat-holder {
  display: flex !important;
  flex-direction: column;
}
.chat-area {
  display: block;
  height: 80%;
  width: 100%;
  overflow-y: scroll !important;
  overscroll-behavior-y: contain;
  scroll-snap-type: y proximity;
}

.chat-area > div > div:last-child {
  scroll-snap-align: end;
}

.text-block {
  /* white-space: pre-line; */
  justify-self: center;
}

.text-area {
  position: fixed !important;
  bottom: 0px;
  right: 0px;
  width: 100%;
  height: 15%;
  color: antiquewhite;
}
.chat-bubble {
  display: flex;
  align-items: center;
}
/* width */
::-webkit-scrollbar {
  width: 6px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #1e1e1e;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: rgb(99, 98, 98);
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: rgb(110, 98, 98);
}
</style>
