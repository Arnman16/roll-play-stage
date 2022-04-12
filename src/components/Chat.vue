<template>
  <v-container
    class="align-start pa-0 ma-0 ba-0 flex"
    :style="`height: ${fullHeight}px`"
  >
    <v-container
      fluid
      class="chat-area"
      :style="`height: ${chatHeight}px`"
      id="chat-area"
    >
      <div style="height: 50px; opacity: 0.15" class="text-center">
        End of chat
      </div>

      <v-row v-for="(msg, index) in messages" :key="index">
        <v-tooltip left open-delay="350" color="#22222299">
          <template v-slot:activator="{ on, attrs }">
            <v-container v-bind="attrs" v-on="on" class="ma-0 pa-0">
              <v-col v-if="msg.diceRoll">
                <v-card flat tile outlined color="black">
                  <v-card-title>Dice Roll - {{ msg.name }}</v-card-title>
                  <v-card-text class="mx-auto pa-1 text-block">
                    {{ msg.message }}
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col v-else-if="msg.location" class="py-1 px-0">
                <v-card
                  :disabled="!sessionActive"
                  @click="setChatPin(msg.message)"
                  flat
                  tile
                  :color="msg.message.color"
                >
                  <v-card-text
                    :class="
                      `text-center text-body-2 font-italic pa-0 ${getTextColor(
                        msg.message.color
                      )}--text`
                    "
                  >
                    <v-icon
                      small
                      :color="getTextColor(msg.message.color)"
                      class="mx-1"
                      >mdi-map-marker</v-icon
                    >
                    {{ `${msg.name} dropped a pin` }}
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col
                v-else
                cols="12"
                :class="
                  user && msg.uid == user.uid
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
                  user && msg.uid == user.uid
                    ? 'pl-2 pr-0 pt-0 pb-1 ma-0 ba-0'
                    : 'pl-0 pr-2 pt-0 pb-1 ma-0 ba-0'
                "
              >
                <v-card
                  flat
                  :color="
                    user && msg.uid == user.uid
                      ? '#121212'
                      : 'rgba(42,47,49,0.7)'
                  "
                  ><v-container class="chat-bubble">
                    <v-card-text class="mx-auto text-block pa-0"
                      >{{ msg.message }}
                    </v-card-text>
                  </v-container>
                </v-card>
              </v-col>
            </v-container>
          </template>
          <span>{{ getTimeString(msg.timestamp) }}</span>
        </v-tooltip>
      </v-row>
      <span id="chatEnd"></span>
    </v-container>
    <v-card width="100%" class="ma-0 pa-0 mt-auto">
      <v-textarea
        :disabled="!isAuthenticated"
        solo
        :value="chatText"
        id="chat-text"
        flat
        ref="pos"
        outlined
        fill-width
        hide-details
        rows="3"
        @keypress.enter.exact.prevent="sendMessage"
        class="pa-1 text-area text-block"
      ></v-textarea>
    </v-card>
  </v-container>
</template>

<script>
import { db, firebase, auth } from "../db";
import { mapGetters } from "vuex";
import { debounce } from "lodash";
const { DateTime } = require("luxon");
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
      headerHeight: "headerHeight",
      isAuthenticated: "isAuthenticated",
      isOwner: "isStageOwner",
      sessionActive: "isSessionActive",
    }),
  },
  watch: {
    stage(stageVal) {
      if (stageVal) {
        this.setChatWatchers();
        this.getHeights();
      }
    },
  },
  data() {
    return {
      signInToChat: false,
      messages: [],
      scrollToNewMsg: true,
      chatHeight: 0,
      fullHeight: 0,
      chatRef: null,
      chatText: "",
      options: {
        duration: 50,
        container: "#chat-area",
      },
    };
  },
  methods: {
    getTextColor(bgColor) {
      let lightColor = "white";
      let darkColor = "black";
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
    clearMessage() {
      document.getElementById("chat-text").value = "";
      this.chatText = "";
      this.$refs.pos.reset();
    },
    sendMessage() {
      let text = document.getElementById("chat-text").value;
      if (text.replace("\n", "") < 2) return;
      if (!auth.currentUser) return;
      text = text.replace(/^\n|\n$/g, "");
      let message = {
        message: text,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        uid: this.user.uid,
        name: this.user.displayName.split(" ")[0],
      };
      this.chatRef
        .push(message, (error) => {
          if (error) {
            console.log("chat tx error", error);
          }
        })
        .then(() => {
          this.clearMessage();
        });
    },
    getTimeString(epoch) {
      var dt = DateTime.fromSeconds(epoch / 1000);
      return dt.toLocaleString(DateTime.DATETIME_MED);
    },
    setChatRef() {
      const path = `users/${this.stage.owner}/stages/${this.stage.slug}`;
      const chatPath = `${path}/chat`;
      if (this.chatRef) this.chatRef.off();
      this.chatRef = db.database().ref(chatPath);
    },
    setChatWatchers() {
      this.setChatRef();
      if (auth.currentUser || !this.signInToChat) {
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
    getHeights() {
      this.fullHeight = this.$vuetify.breakpoint.mdAndDown
        ? window.innerHeight - 35
        : window.innerHeight - this.headerHeight - 35;
      this.chatHeight = this.fullHeight - 104;
    },
  },
  mounted() {
    this.$vuetify.goTo("#chatEnd", this.options);
    document.getElementById("chat-text").enterKeyHint = "send";
    this.getHeights();
    window.addEventListener("resize", () => {
      this.getHeights();
    });
    if (this.stage) {
      this.setChatWatchers();
    }
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
  /* display: block; */
  /* height: 80%; */
  width: 100%;
  overflow-y: scroll !important;
  overscroll-behavior-y: contain;
  scroll-snap-type: y proximity;
}

.chat-area > div > div:last-child {
  scroll-snap-align: end;
}

.text-block {
  white-space: pre-line;
  justify-items: center;
  text-justify: center;
}

.text-area {
  /* position: fixed !important;
  bottom: 0px;
  right: 0px; */
  width: 100%;
  /* height: 15%; */
  color: antiquewhite;
  padding: 0;
}
.chat-bubble {
  display: flex;
  text-justify: center;
  margin: 0px;
  padding: 5px !important;
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
