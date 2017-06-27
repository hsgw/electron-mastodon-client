<template>
    <div class="notifications">
      <notify v-for="notify in notifications" :notify="notify" :key="notify.id"></notify>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import Notify from './Notify';

export default {
  name: 'notifications',
  components: {
    Notify,
  },
  computed: {
    ...mapState({
      notifications: state => state.mastodon.notifications,
    }),
  },
};
</script>

<style lang="scss" scoped>
</style>
