<template>
  <v-container class="align-start pa-0 ma-0 ba-0" fill-height style="display: block;">
    <v-container fluid class="align-start chat-area" id="chat-area">
      <div style="height: 100px; opacity: 0.15" class="text-center">
        End of chat
      </div>
      <v-row v-for="(msg, index) in messages" :key="index">
        <v-col
          v-if="!msg.diceRoll"
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
          v-if="!msg.diceRoll"
          :class="
            msg.uid == user.uid
              ? 'pl-2 pr-0 pt-0 pb-1 ma-0 ba-0'
              : 'pl-0 pr-2 pt-0 pb-1 ma-0 ba-0'
          "
        >
          <v-card
            flat
            
            :color="msg.uid == user.uid ? '#121212' : 'rgba(42,47,49,0.7)'"
          >
            <v-card-text class="mx-auto py-1 text-block px-2">
              {{ msg.message }}
            </v-card-text>
          </v-card>
        </v-col>
        <v-col v-else>
          <v-card flat tile outlined color="black">
            <v-card-title>Dice Roll - {{ msg.name }}</v-card-title>
            <v-card-text class="mx-auto pa-1 text-block">
              {{ msg.message }}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <div id="chatEnd"></div>
    </v-container>
    <v-textarea
      solo
      height="12vh"
      v-model="textArea"
      flat
      outlined
      background-color="rgba(29, 29, 32, 0.7)"
      color="rgba(255, 255, 255, 0.2)"
      class="pa-2"
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
  white-space: pre-line;
}

.text-area {
  /* position: fixed !important;
  bottom: 20px;
  right: 20px; */
  color: red;
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