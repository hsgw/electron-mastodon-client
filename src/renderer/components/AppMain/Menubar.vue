<template>
  <div class="menubar">
    <!--<dropdown-menu class="menu_item">
      <icon slot="button" name="gear"></icon>
      <div slot="menu" class="dropdown status">
        test
      </div>
    </dropdown-menu>-->
    <dropdown-menu class="menu_item">
      <icon slot="button" :name="getVisibilityIcon"></icon>
      <div slot="menu" class="dropdown visiblity">
        <div class="item" @click="setDefaultVisiblity('public')">
          <icon class="icon" slot="button" name="globe"></icon>
          <div class="desc"><div>公開</div><div>公開TLに投稿する</div></div>
        </div>
        <div class="item" @click="setDefaultVisiblity('unlisted')">
          <icon class="icon" slot="button" name="unlock"></icon>
          <div class="desc"><div>非収蔵</div><div>公開TLに表示しない</div></div>
        </div>
        <div class="item" @click="setDefaultVisiblity('private')">
          <icon class="icon" slot="button" name="lock"></icon>
          <div class="desc"><div>非公開</div><div>フォロワーだけに公開</div></div>
        </div>
        <div class="item" @click="setDefaultVisiblity('direct')">
          <icon class="icon" slot="button" name="envelope"></icon>
          <div class="desc"><div>DM</div><div>ダイレクトメッセージ</div></div>
        </div>
      </div>
    </dropdown-menu>
    <div @click="refresh" class="menu_item refresh" :class="{on: isRefreshing}"><icon name="refresh" scale="1"></icon></div>
    <div class="menu_item" @click="logout"><icon name="sign-out" scale="1"></icon></div>
  </div>
</template>

<script>
import DropdownMenu from '../utils/DropdownMenu.vue';

export default {
  name: 'menubar',
  components: {
    DropdownMenu,
  },
  data() {
    return {
      isRefreshing: false,
    };
  },
  computed: {
    getVisibilityIcon() {
      const key = this.$store.state.compose.defaultVisiblity;
      switch (key) {
        case 'public':
          return 'globe';
        case 'unlisted':
          return 'unlock';
        case 'private':
          return 'lock';
        case 'direct':
          return 'envelope';
        case '':
        default :
          return 'eye';
      }
    },
  },
  methods: {
    logout() {
      this.$store.dispatch('logout');
    },
    refresh() {
      if (this.isRefreshing) return;
      this.isRefreshing = true;
      Promise.all([this.$store.dispatch('refreshAllStatuses'), this.$store.dispatch('getNotifications'), this.$store.dispatch('getMyAccount')])
      .then(() => {
        this.isRefreshing = false;
      });
    },
    setDefaultVisiblity(key) {
      this.$store.commit('SET_DEFAULT_VISIBLITY', key);
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../_variables";
  .menubar {
    display: flex;
    text-align: center;
    justify-content: space-between;
    margin-bottom:10px;
    background-color: $content-bg-color;
    border-radius: 5px;
    &>.menu_item {
      flex: 1;
      cursor: pointer;
      padding: 0.5em 0 0.2em 0;
    }
    .refresh {
      &.on {
        cursor: not-allowed;
        color: $success-color;
      }
    }
    .dropdown {
      z-index: 9999;
      position: absolute;
      margin-top: 5px;
      width: 180px;
      background-color: $content-bg-color;
      text-align: left;
      &.status {
        cursor: auto;
      }

      &.visiblity {
        .item {
          padding:0.5em 5px;
          display: flex;
          &:hover, &.active {
            background-color: $success-color;
          }

          .icon {
            margin: 0 10px;
          }
          .desc {
            font-size: smaller;
            :first-child {
              font-size: small;
              font-weight: bold;
            }
          }
        }
      }
    }
  }
</style>
