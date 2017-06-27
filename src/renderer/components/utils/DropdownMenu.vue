<template>
<div>
  <div @click.stop="showMenu = !showMenu">
    <slot name="button"></slot>
  </div>
  <div v-if="showMenu" @close="showMenu = false" @click="showMenu = false">
    <slot name="menu"></slot>
  </div>
</div>
</template>

<script>
export default {
  name: 'dropdown-menu',
  data() {
    return {
      showMenu: false,
    };
  },
  methods: {
    listen(target, eventType, callback) {
      if (!this.eventRemovers) {
        this.eventRemovers = [];
      }
      target.addEventListener(eventType, callback);
      this.eventRemovers.push({
        remove() {
          target.removeEventListener(eventType, callback);
        },
      });
    },
  },
  created() {
    this.listen(document, 'click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.showMenu = false;
      }
    });
  },
  destroyed() {
    if (this.eventRemovers) {
      this.eventRemovers.forEach((v) => {
        v.remove();
      });
    }
  },
};
</script>

<style lang="scss" scoped>
</style>
