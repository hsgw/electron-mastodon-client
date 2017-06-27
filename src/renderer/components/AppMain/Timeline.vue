<template>
    <div class="timeline">
      <toot v-for="toot in toots" :toot="toot" :key="toot.id" />
    </div>
</template>

<script>
import { mapState } from 'vuex';
import Toot from './Toot';

export default {
  name: 'timeline',
  components: {
    Toot,
  },
  computed: {
    ...mapState({
      toots: state => state.mastodon.toots,
    }),
  },
};
</script>

<style>
  
</style>
