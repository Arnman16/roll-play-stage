<template>
  <div>
    <div id="foglayer_01" class="fog">
      <div class="image01"></div>
      <div class="image02"></div>
    </div>
    <div id="foglayer_02" class="fog">
      <div class="image01"></div>
      <div class="image02"></div>
    </div>
    <div id="foglayer_03" class="fog">
      <div class="image01"></div>
      <div class="image02"></div>
    </div>
  </div>
</template>
<script>
export default {
  name: "RollPlayStageEffects",

  data() {
    return {};
  },

  mounted() {},

  methods: {},
};
</script>
<style lang="scss">
/* ---------- Rain ---------- */

.rain__drop
  animation-delay calc(var(--d) * 1s)
  animation-duration calc(var(--a) * 1s)
  animation-iteration-count infinite
  animation-name drop
  animation-timing-function linear
  height 30px
  left calc(var(--x) * 1%)
  position absolute
  top calc((var(--y) + 50) * -1px)

  path
    fill #a1c6cc
    opacity var(--o)
    transform scaleY(calc(var(--s) * 1.5))

@keyframes drop
  90%
    opacity 1
  100%
    opacity 0
    transform translateY(100vh)
</style>
