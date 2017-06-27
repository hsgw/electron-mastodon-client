<template>
<div class="wrapper">
  <div class="content">
    <h1>{{appName}} <small><br />ひきこもり専用マストドンクライアント</small></h1>
    <p>{{ serverURL }}</p>
    <div v-show="isLoading" class="loading">
      <icon name="circle-o-notch" scale="2" spin></icon> Loading...
    </div>
    <div v-if="error.title" class="error">
      <div>エラー:{{ error.title }}</div>
      <div>{{ error.message }}</div>
    </div>
    <div v-show="!isLoading" @click="reset" class="reset">
      <icon class="icon" name="arrow-left" scale="1.2"></icon>&nbsp;最初からやりなおす</div>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex';
import router from '../router';

export default {
  name: 'app-index',
  data() {
    return {
      isLoading: true,
      error: {},
    };
  },
  computed: mapState({
    appName: state => state.auth.appName,
    serverURL: state => state.auth.serverURL,
  }),
  methods: {
    reset() {
    },
  },
  created() {
    this.$store.dispatch('initAuthorizeData')
    .then(() => this.$store.dispatch('login'))
    .then(() => {
      router.push('main');
      Promise.resolve(); // eslint-disable-line
    })
    .catch((err) => {
      console.log(err);
      if (err === undefined) {
        router.push('auth');
      }
    });
  },
};
</script>

<style lang="scss">
@import '_global';
</style>

<style lang="scss" scoped>
@import '_variables';
  .wrapper {
    display: flex;
    .content {
      width: 400px;
      margin: auto;
      .loading {
        color: $success-color;
        font-size: 2em;
      }
      .error {
        width: 400px;
        color: $danger-color;
      }
    }
    .reset {
      cursor: pointer;
      margin: 3em 0;
    }
  }
</style>
