<template>
<div id="appmain">
  <div class="side-content">
    <menubar></menubar>
    <user></user>
    <compose></compose>
    <div class="notifications">
      <VuePerfectScrollbar class="scrollbar" v-once :settings="settings">
        <notifications></notifications>
      </VuePerfectScrollbar>
    </div>
  </div>
  <div class="main-content">
    <VuePerfectScrollbar class="timeline" v-once :settings="settings">
      <timeline></timeline>
    </VuePerfectScrollbar>
  </div>
</div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import Menubar from './AppMain/Menubar.vue';
import User from './AppMain/User.vue';
import Compose from './AppMain/Compose.vue';
import Notifications from './AppMain/Notifications.vue';
import Timeline from './AppMain/Timeline.vue';

import router from '../router';

export default {
  name: 'app-main',
  components: {
    VuePerfectScrollbar, Menubar, User, Compose, Notifications, Timeline,
  },
  data() {
    return {
      settings: {
        maxScrollbarLength: 100,
        minScrollbarLength: 20,
        suppressScrollX: true,
      },
    };
  },
  created() {
    if (!this.$store.state.mastodon.toots.length) {
      router.push('/');
    }
  },
};
</script>

<style lang="scss">
@import './_global';
@import '/node_modules/emojione/assets/css/emojione.min.css';
</style>

<style lang="scss" scoped>
@import './_variables';
#appmain {
  height: 100%;
  .menubar {
    width: $side_width;
  }
  .side-content {
    float: left;
    width: $side_width;
    height: 100%;
    margin: 0 0.5em;
    .notifications {
      width: $side_width;
      .scrollbar {
        position: absolute;
        height: calc(100% - 220px);
      }
    }
  }
  .main-content {
    float: left;
    height: 100%;
    .timeline {
      position: absolute;
      height: 100%;
      width: $main_width;
    }
  }
}

</style>
