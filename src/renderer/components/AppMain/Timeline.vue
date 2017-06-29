<template>
    <div class="timeline">
      <toot v-for="toot in toots" :toot="toot" :key="toot.id"></toot>
      <div class="get_prev">
        <icon v-if="isFetchingPrev" class="icon" name="refresh" scale="1" spin></icon>
        <span v-else @click="fetchPrev"><a>これより前を取得</a></span>
      </div>
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
  data() {
    return {
    };
  },
  computed: {
    ...mapState({
      toots: state => state.mastodon.toots,
      isFetchingPrev: state => state.mastodon.isFetchingPrevToots,
    }),
  },
  methods: {
    fetchPrev() {
      console.log('fetchPrev');
      this.$store.dispatch('fetchPrevStatuses');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../_variables.scss';
.get_prev {
  text-align: center;
  width: 100%;
  padding: 10px 0;
  .icon {
    color: $success-color;
  }
  span {
    cursor: pointer;
  }
}
</style>
