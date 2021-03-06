<template>
  <div>
    <div v-if="stage !== null">
      <CanvasOwner />
      <!-- <CanvasOwner v-if="isOwner" />
      <CanvasViewer v-else /> -->
    </div>
    <v-container fluid fill-height v-else-if="!stage && !loading">
      <v-row justify="space-around">
        <v-col align="center">
          <v-card class="mx-auto">
            <v-card-text>
              <h1 class="mx-auto">stage not found.</h1>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import CanvasOwner from "./CanvasOwner.vue";
// import CanvasViewer from "./CanvasViewer.vue";
import { db, firebase, auth } from "../db";
import { mapGetters } from "vuex";
export default {
  name: "Stage",
  components: {
    CanvasOwner,
    // CanvasViewer,
  },
  watch: {
    $route: {
      handler: "fetchStage",
      immediate: true,
    },
    stage(stageVal) {
      if (stageVal) {
        this.setUserWatchers();
        this.setUserStatus();
      }
    },
    stageSaved(isSaved) {
      if (this.userStatusDatabaseRef) {
        console.log("IS SAVED", isSaved);
        this.userStatusDatabaseRef.update({ saved: isSaved });
      }
    },
  },
  computed: {
    ...mapGetters({
      user: "user",
      loading: "loading",
      stage: "stage",
      isAuthenticated: "isAuthenticated",
    }),
    activeUsers: {
      get() {
        return this.$store.getters.activeUsers;
      },
      set(val) {
        this.$store.dispatch("setActiveUsers", val);
      },
    },
    stageSaved: {
      get() {
        return this.$store.getters.stageSaved;
      },
      set(val) {
        this.$store.dispatch("setStageSaved", val);
      },
    },
    slug() {
      return this.$route.params.slug;
    },
    isOwner() {
      if (!this.stage) return false;
      if (!this.isAuthenticated) return false;
      return this.user.uid === this.stage.owner;
    },
  },
  data() {
    return {
      stageUsersRef: null,
      infoConnectedRef: null,
      userStatusDatabaseRef: null,
    };
  },
  methods: {
    fetchStage() {
      this.detatchWatchers();
      this.setOffline();
      this.$store.dispatch("fetchStage", this.$route.params.slug);
    },
    setUserStatus() {
      if (auth.currentUser) {
        const slug = `users/${this.stage.owner}/stages/${this.stage.slug}`;
        const viewersSlug = `${slug}/viewers/`;
        // console.log(auth.currentUser);
        // Fetch the current user's ID from Firebase Authentication.
        var uid = auth.currentUser.uid;

        // Create a reference to this user's specific status node.
        // This is where we will store data about being online/offline.
        // var userStatusDatabaseRef = db.database().ref("/status/" + uid);
        this.userStatusDatabaseRef = db.database().ref(viewersSlug + uid);

        // We'll create two constants which we will write to
        // the Realtime database when this device is offline
        // or online.
        var isOfflineForDatabase = {
          online: false,
          modified: firebase.database.ServerValue.TIMESTAMP,
          // displayName: this.user.displayName,
          // photoURL: this.user.photoURL,
          // slug: this.user.slug,
          // uid: uid,
        };

        var isOnlineForDatabase = {
          online: true,
          modified: firebase.database.ServerValue.TIMESTAMP,
          displayName: this.user.displayName,
          photoURL: this.user.photoURL,
          slug: this.user.slug ? this.user.slug : '/',
          uid: uid,
          saved: false,
        };

        // Create a reference to the special '.info/connected' path in
        // Realtime Database. This path returns `true` when connected
        // and `false` when disconnected.
        this.infoConnectedRef = db.database().ref(".info/connected");

        this.infoConnectedRef.on("value", (snapshot) => {
          // If we're not currently connected, don't do anything.
          if (snapshot.val() == false) {
            return;
          }
          // If we are currently connected, then use the 'onDisconnect()'
          // method to add a set which will only trigger once this
          // client has disconnected by closing the app,
          // losing internet, or any other means.
          this.userStatusDatabaseRef
            .onDisconnect()
            .update(isOfflineForDatabase)
            .then(() => {
              // The promise returned from .onDisconnect().set() will
              // resolve as soon as the server acknowledges the onDisconnect()
              // request, NOT once we've actually disconnected:
              // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

              // We can now safely set ourselves as 'online' knowing that the
              // server will mark us as offline once we lose connection.
              this.userStatusDatabaseRef.set(isOnlineForDatabase);
            });
        });
      }
    },
    setUserWatchers() {
      this.activeUsers = [];
      const slug = `users/${this.stage.owner}/stages/${this.stage.slug}`;
      const viewersSlug = `${slug}/viewers`;
      if (this.stageUsersRef) this.stageUsersRef.off();

      this.stageUsersRef = db.database().ref(viewersSlug);

      this.stageUsersRef.on("child_changed", (snapshot) => {
        const val = snapshot.val();
        let notMe = true;
        if (this.user) notMe = snapshot.key !== this.user.uid;
        let active = this.activeUsers.filter(
          (item) => item.uid !== snapshot.key
        );
        if (val.online && notMe) {
          active.push(val);
          // console.log("change pushed");
        }
        this.activeUsers = active;
      });
      this.stageUsersRef.on("child_added", (snapshot) => {
        const val = snapshot.val();
        let notMe = true;
        if (this.user) notMe = snapshot.key !== this.user.uid;
        if (!notMe) {
          if (val.saved) this.stageSaved = val.saved;
        }
        let active = this.activeUsers.filter(
          (item) => item.uid !== snapshot.key
        );
        if (val.online && notMe) {
          active.push(val);
          // console.log("change pushed");
        }
        this.activeUsers = active;
      });
    },
    detatchWatchers() {
      if (this.infoConnectedRef) this.infoConnectedRef.off();
      if (this.stageUsersRef) this.stageUsersRef.off();
      if (this.userStatusDatabaseRef) this.userStatusDatabaseRef.off();
    },
    setOffline() {
      this.activeUsers = [];
      if (auth.currentUser) {
        var isOfflineForDatabase = {
          online: false,
          modified: firebase.database.ServerValue.TIMESTAMP,
          // displayName: this.user.displayName,
          // photoURL: this.user.photoURL,
          // slug: this.user.slug,
          // uid: this.user.uid,
        };
        if (this.userStatusDatabaseRef) {
          this.userStatusDatabaseRef.update(isOfflineForDatabase);
        }
        this.detatchWatchers();
      }
    },
  },
  mounted() {
    // this.$store.dispatch("fetchStage", this.$route.params.slug);
  },
  beforeDestroy() {
    this.setOffline();
    this.$store.commit("SET_STAGE", null);
  },
};
</script>

<style scoped>
.html {
  overflow-y: hidden;
}
.v-main {
  overflow-y: hidden;
}
</style>