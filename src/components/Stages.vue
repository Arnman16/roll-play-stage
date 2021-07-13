<template>
  <v-container fluid fill-height class="posts">
    <v-container fluid :class="isMobile ? 'ma-0 pa-0' : 'ma-2'">
      <transition-group name="list" tag="div" class="py-0">
        <StageCard
          created="1625773730209"
          v-for="stage in stages"
          :key="stage.slug"
          :slug="'/stages/' + stage.slug"
          :name="stage.pageName"
          details="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        >
        </StageCard>
      </transition-group>
    </v-container>
    <v-spacer></v-spacer>
  </v-container>
</template>

<script>
import StageCard from "./StageCard.vue";
import { stagesCollection } from "../db";
export default {
  name: "Stage",
  components: {
    StageCard,
  },
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.mobile;
    },
    loading: {
      get() {
        return this.$store.getters.loading;
      },
      set(val) {
        this.$store.commit("SET_LOADING", val);
      },
    },
  },
  data() {
    return {
      stages: [],
    };
  },
  methods: {
    getStages() {
      stagesCollection.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          let stage = doc.data();
          this.stages.push(stage);
        });
      });
    },
  },
  mounted() {
    this.getStages();
    this.loading = false;
  },
};
</script>

<style scoped>
.v-card {
  transition: opacity 0.1s ease-in-out;
}

.v-card:not(.on-hover) {
  opacity: 0.8;
  filter: grayscale(90%);
}
.list {
  will-change: opacity;
}

.list-enter,
.list-leave-to {
  opacity: 0;
}
.list-move-to {
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: opacity 0.2s ease;
}

.list-move {
  transition: opacity 0.2s ease-out;
}

.my-date {
  opacity: 0.3;
}
.posts {
  align-content: flex-start;
  max-width: 780px;
}
</style>