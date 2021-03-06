<template>
  <v-container>
    <div v-for="(image, index) in images" :key="index">
      <img height="75" width="75" :src="image.url" alt="" />
    </div>
  </v-container>
</template>
<script>
export default {
  name: "SidePanel",
  data() {
    return {
      images: [
        {
          name: "Donald Trump",
          url: "http://i.imgur.com/QcJru0b.png",
        },
        {
          name: "Hilary Clinton",
          url: "http://i.imgur.com/Yp9zAaY.png",
        },
        {
          name: "Bernie Sanders",
          url: "http://i.imgur.com/K4ZroX1.png",
        },
        {
          name: "Barack Obama",
          url: "http://i.imgur.com/j7zfXYB.png",
        },
        {
          name: "Joe Biden",
          url: "http://i.imgur.com/ZACKyqE.png",
        },
      ],
    };
  },
};
</script>