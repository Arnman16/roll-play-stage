<template>
  <v-container fluid fill-height style="'align-items', 'center'">
    <v-row justify="space-around" align="center">
      <v-col align="center">
        <div>HOME</div>
      </v-col></v-row
    ></v-container
  >
</template>

<script>
export default {
  name: "Home",
  components: {},
  computed: {
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
    return {};
  },
  methods: {},
  mounted() {
    this.loading = false;
  },
};
</script>