<template>
  <v-hover v-slot="{ hover }">
    <v-slide-y-transition>
      <v-card
        :ripple="{ class: 'indigo--text' }"
        :elevation="hover ? 12 : 2"
        :class="{
          'on-hover': hover,
        }"
        class="mx-auto my-2"
        max-width="isMobile ? '98%' : '75%'"
        :to="slug"
      >
        <v-list-item three-line>
          <v-list-item-content>
            <v-list-item-title class="headline mb-1">
              {{ name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              <span>{{ details | trimLength }}</span>
            </v-list-item-subtitle>
            <!-- <v-divider class="ma-3"></v-divider> -->
            <span class="text-caption my-date">{{ created | formatDate }}</span>
          </v-list-item-content>
          <v-list-item-avatar tile size="120" color="black"
            ><v-img
              :src="thumbnail ? thumbnail : 'https://i.imgur.com/2UgUzFV.png'"
            ></v-img
          ></v-list-item-avatar>
        </v-list-item>
      </v-card>
    </v-slide-y-transition>
  </v-hover>
</template>

<script>
import moment from "moment";
export default {
  name: "StageCard",
  props: {
    name: String,
    details: String,
    thumbnail: String,
    created: String,
    slug: String,
  },
  filters: {
    formatDate(val) {
      if (!val) {
        return "-";
      }
      let date = moment(val, "x").format("DD MMM YYYY hh:mm a");
      return moment(date).fromNow();
    },

    trimLength(val) {
      if (!val) {
        return "-";
      }
      if (val.length < 200) {
        return val;
      }
      return `${val.substring(0, 200)}...`;
    },
  },
  components: {},
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.mobile;
    },
  },
  data() {
    return {};
  },
  methods: {},
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
}
</style>