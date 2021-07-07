<template>
  <v-container fluid>
    <v-card
      :color="
        $vuetify.theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)'
      "
      class="ma-3"
      ><v-container>
        <div class="content-text-home">
          <h1 class="mx-auto mt-5">Oops!</h1>
          <br />
          It looks like the page you're looking for cannot be found.
          <br />
          <br />
          <v-btn outlined to="/">
            Go Home
          </v-btn>
        </div>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "NotFound",
  components: {},
  computed: {},
};
</script>

<style scoped>
.content-text >>> p {
  /* color: red; */
  line-height: 1px;
  margin: 10px 0;
}
.content-text {
  font-size: 16px;
  font-weight: 250;
}
</style>
