<template>
    <div class="notify">
    <div v-if="notify.type === 'reblog' || notify.type === 'favourite'">
      <div class="with_status">
        <div class="header">
          <icon v-if="notify.type === 'reblog'" class="icon reblog" name="retweet"></icon>
          <icon v-if="notify.type === 'favourite'" class="icon fav" name="star"></icon>
          <a :href="notify.account.url" target="_blank">@{{ notify.account.acct }}</a>
        </div>
        <div v-html="notify.status.content" class="content">
        </div>
      </div>
    </div>
    <div v-if="notify.type === 'mention'" class="mention">
      <div class="header">
        <icon class="icon" name="share"></icon><a :href="notify.account.url" target="_blank"> @{{ notify.account.acct }} </a>
      </div>
      <toot :toot="notify.status"></toot>
    </div>
    <div v-if="notify.type === 'follow'" class="follow">
      <a :href="notify.account.url" target="_blank">
        <div><icon class="icon" name="user-plus"></icon> @{{notify.account.acct}}</div>
        <div v-emoji-render:name="notify.account.display_name"></div>
      </a>
    </div>
    </div>
</template>

<script>
// import { mapState } from 'vuex';
import Toot from './Toot.vue';

export default {
  name: 'notify',
  props: ['notify'],
  components: {
    Toot,
  },
  computed: {
  },
};
</script>

<style lang="scss">
@import '../_variables.scss';
  .with_status {
    .content {
      font-size: 11px;
      color: $hidden-color;
      p {
        margin: 0.2em 0;
        line-height: 1.2em;
      }
    }
  }
</style>

<style lang="scss" scoped>
@import '../_variables.scss';
.notify {
  a:hover {
    text-decoration: none;
  }
  width: $side-width;
  .with_status {
    .header{
      margin-bottom: 0.3em;
    }
    .icon {
      position: relative;
      top: 3px;
      &.reblog {
        color: $reblog-color;
      }
      &.fav {
        color: $fav-color;
      }
    }
  }
  .mention {
    .icon {
      position: relative;
      color: $reblog-color;
      top: 3px;
    }
  }
  .follow {
    .icon {
      position: relative;
      color: $success-color;
      top: 3px;
    }
  }
}
</style>
