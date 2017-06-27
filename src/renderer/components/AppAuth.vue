<template>
<div class="wrapper">
  <div class="content">
    <h1>{{appName}} <small><br />ひきこもり専用マストドンクライアント</small></h1>
    <div v-if="!hasAuthURL || !hasClientID">
      <div>
        https://も含めたインスタンスのURLを入力して下さい
      </div>
      <form @submit="submitUrl">
        <input type="input" v-model="inputUrl" placeholder="https://" required  :disabled="isLoading" />
        <button type="submit" :disabled="isLoading">送信</button>
      </form>
    </div>
    <div v-else>
      <div>
        表示されたURLにアクセスして、アクセストークンをコピペして下さい
      </div>
      <div class="authURL">
        <a :href="authURL" target="_blank">{{ authURL }}</a>
      </div>
      <form @submit="submitCode">
        <input type="input" v-model="inputCode" placeholder="Paste your token here" required :disabled="isLoading" />
        <button type="submit" :disabled="isLoading">送信</button>
      </form>
    </div>
    <div v-show="isLoading"><icon class="icon" name="circle-o-notch" scale="1.2" spin></icon>&nbsp;Loading...</div>
    <div v-if="error.title" class="error">
      <div>エラー:{{ error.title }}</div>
      <div>{{ error.message }}</div>
    </div>
    <div v-show="!isLoading && (hasAuthURL || hasClientID)" @click="reset" class="reset">
      <icon class="icon" name="arrow-left" scale="1.2"></icon>&nbsp;最初からやりなおす</div>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'app-auth',
  data() {
    return {
      inputUrl: '',
      inputCode: '',
      isLoading: false,
      error: {},
    };
  },
  computed: mapState({
    appName: state => state.auth.appName,
    authURL: state => state.auth.authURL,
    hasClientID: (state) => {
      const { serverURL, clientID, clientSeclet } = state.auth;
      return (serverURL !== '' && clientID !== '' && clientSeclet !== '');
    },
    hasAuthURL: state => state.auth.authURL !== '',
  }),
  methods: {
    submitUrl(e) {
      e.preventDefault();
      this.isLoading = true;
      this.error = {};
      this.$store.dispatch('requestAuthURL', this.inputUrl)
      .catch((err) => {
        this.error = {
          title: 'インスタンスのURLが違うかサーバーが落ちてるかも',
          message: err.toLocaleString(),
        };
      })
      .then(() => {
        this.isLoading = false;
      });
      return false;
    },
    submitCode(e) {
      e.preventDefault();
      this.isLoading = true;
      this.error = {};
      this.$store.dispatch('requestAccessToken', this.inputCode)
      .catch((err) => {
        if (err.data) {
          const data = JSON.parse(err.data);
          this.error = {
            title: `${String(err.statusCode)} ${data.error}`,
            message: data.error_description,
          };
        } else {
          this.error = {
            title: '何かエラー',
            message: err.toLocaleString(),
          };
        }
      })
      .then(() => {
        this.isLoading = false;
      });
      return false;
    },
    reset() {
      this.error = {};
      this.$store.commit('CLEAR_AUTH');
    },
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
      margin: auto;
      input {
        width: 300px;
        margin: 0.5em 0;
        padding: 0.2em;
      }
      button:disabled {
        cursor: not-allowed;
      }
      .authURL {
        margin: 1em 0;
        padding: 10px;
        max-width: 400px;
        word-break: break-all;
        a {
          color: $success-color;
        }
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
