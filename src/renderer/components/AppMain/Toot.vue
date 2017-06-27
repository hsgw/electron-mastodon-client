<template>
  <div class="toot">
    <div class="avatar">
      <div>
        <img :src="toot.account.avatar">
      </div>
      <div class="tootType" :class="tootTypeClass">
        <icon class="icon" :name="tootType"></icon>
      </div>
    </div>
    <div class="content">
      <div class="header">
        <div class="name">
          <a :href="toot.account.url" target="_blank">
            <div class="display" v-emoji-render:data="toot.account.display_name"></div>
            <div class="user">{{ '@'+toot.account.acct }}</div>
          </a>
        </div>
        <a :href="toot.url" target="_blank" class="date">
          {{ getDate }}<br> {{ getTime }}
        </a>
      </div>
      <div v-if="hasSpoiler" class="status spoiler">
      <span v-emoji-render:spoiler="toot.spoiler_text"></span>
      <button @click="toggleSpoiler">...</button>
      </div>
      <div v-show="isOpened" class="status" v-emoji-render:status="toot.content"></div>
      <media-attachments :attachments="toot.media_attachments" :sensitive="(toot.sensitive !== true)"></media-attachments>
      <div class="status_action">
        <div @click="reply"><icon class="icon reply" name="reply" scale="0.9"></icon></div>
        <div @click="boost(toot.id, toot.uri, !toot.reblogged)"><icon class="icon boost" :class="{on:toot.reblogged}" name="retweet" scale="0.9"></icon></div>
        <div @click="favorite(toot.id, toot.uri, !toot.favourited)"><icon class="icon fav" :class="{on:toot.favourited}" name="star" scale="0.9"></icon></div>
        <div v-if="isMyToot" @click="deleteToot(toot.id)"><icon class="icon del"  name="trash" scale="0.9"></icon></div>
        <!--<div><icon class="icon bar" name="bars"></icon></div>-->
      </div>
    </div>
  </div>
</template>

<script>
import MediaAttachments from './MediaAttachments.vue';

const zeroPadding = num => (`0${num}`).slice(-2);

export default {
  name: 'toot',
  props: ['toot'],
  components: {
    MediaAttachments,
  },
  data() {
    return {
      hasSpoiler: false,
      isOpened: true,
    };
  },
  computed: {
    getDate() {
      const date = new Date(this.toot.created_at);
      return `${zeroPadding(date.getMonth() + 1)}/${zeroPadding(date.getDate())}`;
    },
    getTime() {
      const date = new Date(this.toot.created_at);
      return `${zeroPadding(date.getHours())}:${zeroPadding(date.getMinutes())}`;
    },
    isMyToot() {
      return this.toot.account.acct === this.$store.state.mastodon.myAccount.acct;
    },
    tootType() {
      if (this.toot.in_reply_to_id != null) return 'reply';
      switch (this.toot.visibility) {
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
    tootTypeClass() {
      if (this.toot.in_reply_to_id != null) return 'reply';
      switch (this.toot.visibility) {
        case 'public':
          return 'public';
        case 'unlisted':
          return 'private';
        case 'private':
          return 'private';
        case 'direct':
          return 'reply';
        default :
          return '';
      }
    },
  },
  methods: {
    reply() {
      if (this.toot.visibility === 'direct') this.$store.commit('CHANGE_VISIBILITY', 'direct');
      else this.$store.commit('CHANGE_VISIBILITY', 'unlisted');
      this.$store.dispatch('reply', this.toot);
    },
    favorite(id, uri, flag) {
      this.$store.dispatch('favorite', { id, uri, flag });
    },
    boost(id, uri, flag) {
      this.$store.dispatch('boost', { id, uri, flag });
    },
    deleteToot(id) {
      this.$store.dispatch('deleteToot', id);
    },
    toggleSpoiler() {
      this.isOpened = !this.isOpened;
    },
  },
  created() {
    if (this.toot.spoiler_text) {
      this.hasSpoiler = true;
      this.isOpened = false;
    }
  },
};
</script>

<style lang="scss">

.toot {
  .status {
    margin-top: 0.5em;
    word-wrap: break-word;
    P {
      margin:0.3em;
    }
    .h-card {
      a {
        margin:0;
        display: inline;
      }
    }
    a {
      display: block;
      word-break: break-all;
      margin-top:0.2em;
      span{
        &.ellipsis::after {
          content: "\2026";
        }
        &.invisible {
          display: none;
        }
      }
    }
    span {
      margin:0;
    }
  }
}
</style>

<style lang="scss" scoped>
@import '../_variables.scss';

.toot {
  vertical-align: text-bottom;
  display: flex;
  background-color: $content-bg-color;
  margin: 0 10px 0 5px;
  padding: 1em 0.5em 0.5em 0.5em;
  border-bottom-color: $bg-color;
  border-bottom-style: solid;
  border-bottom-width: 1px;

  .avatar {
    display: flex;
    flex-direction: column;
    div { 
      text-align: center;
      img {
        width:32px;
        height:32px;
        margin-bottom: 5px;
      }
    }
    .tootType {
      &.public {
        color: darken($hidden-color, 50%);
      }
      &.reply {
        color: $success-color;
      }
    }
  }
  .spoiler {
    button {
      margin-left:5px;
    }
  }
  .content {
    width: 100%;
    margin-left: 0.5em;
    .header {
      display:flex;
      flex-wrap: wrap;
      .name {
        a:hover {
          text-decoration: none;
        }
        @mixin ellipsis {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .display {
          @include ellipsis;
          max-width: 180px;
        }
        .user {
          @include ellipsis;
          max-width: 180px;
          color: grey;
          font-size: smaller;
        }
      }
      .date {
        margin-left: auto;
        color: grey;
        font-size: x-small;
      }
    }
  }
  .status_action {
    margin-top: 1em;
    display: flex;
    justify-content: space-between;
    width: 120px;
    line-height: 0.8em;
    div {
      cursor: pointer;
      .icon {
        &.fav.on {
          color:$fav-color;
        }
        &.boost.on {
          color:$reblog-color;
        }
      }
    }
  }
}
</style>