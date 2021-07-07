<template>
  <div v-if="stage">
    <!-- <h1>{{stage.pageName}}</h1> -->
    <Canvas2 />
  </div>
  <v-container fluid fill-height v-else>
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
</template>

<script>
import Canvas2 from "./Canvas2.vue";
export default {
  name: "Stage",
  components: {
    Canvas2,
  },
  watch: {
    slug(val) {
      if (!this.stage) this.$store.dispatch("fetchStage", val);
      else if (this.stage.slug !== val) {
        this.$store.dispatch("fetchStage", val);
      }
    },
  },
  computed: {
    stage() {
      return this.$store.getters.stage;
    },
    slug() {
      return this.$route.params.slug;
    },
  },
  data() {
    return {};
  },
  methods: {},
  mounted() {
    this.$store.dispatch("fetchStage", this.$route.params.slug);
  },
};
</script>