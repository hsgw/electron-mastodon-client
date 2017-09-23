<template>
  <div id="compose">
    <div v-if="reply.id" class="reply">
      <div class="title">
        <div>
          <icon name="reply" scale="0.7"></icon>
        </div>
        <div class="close" @click="clearReply">
          <icon name="close" scale="1"></icon>
        </div>
      </div>
      <div class="name">
        <span v-emoji-render:data="reply.account.display_name"></span>
        <span>{{ '@'+reply.account.acct }}</span>
      </div>
      <div v-emoji-render:data="reply.content" class="content"></div>
    </div>
    <div v-if="isEnableSpoiler" class="spoiler">
      <input v-model="spoiler_text"></input>
    </div>
    <div class="inputarea">
      <div class="text_container">
        <div class="text">
          <textarea v-model="status" rows="4" v-autosize="status" @keydown="textareaKeydown" @paste="textareaPaste" @blur="textareaBlur"></textarea>
        </div>
        <div class="picker_container">
          <div @click="clickPickerIcon"><icon class="icon" name="smile-o"></icon></div>
          <div @click="clickPickerIcon" v-show="isOpenPicker" class="picker_bg"></div>
          <picker @click="pickEmoji" v-show="isOpenPicker" class="picker" set="twitter" :emojiSize="16" :perLine="9"></picker>
        </div>
      </div>
      <upload-media></upload-media>
    </div>
    <div class="control">
      <div @click="openFileDialog" class="icon_button">
        <icon name="image"></icon>
      </div>
      <dropdown-menu class="icon_button">
        <icon slot="button" :name="getVisibilityIcon"></icon>
        <div slot="menu" class="dropdown">
          <div class="item" @click="visibilityChange('public')">
            <icon class="icon" slot="button" name="globe"></icon>
            <div class="desc"><div>公開</div><div>公開TLに投稿する</div></div>
          </div>
          <div class="item" @click="visibilityChange('unlisted')">
            <icon class="icon" slot="button" name="unlock"></icon>
            <div class="desc"><div>非収蔵</div><div>公開TLに表示しない</div></div>
          </div>
          <div class="item" @click="visibilityChange('private')">
            <icon class="icon" slot="button" name="lock"></icon>
            <div class="desc"><div>非公開</div><div>フォロワーだけに公開</div></div>
          </div>
          <div class="item" @click="visibilityChange('direct')">
            <icon class="icon" slot="button" name="envelope"></icon>
            <div class="desc"><div>DM</div><div>ダイレクトメッセージ</div></div>
          </div>
        </div>
      </dropdown-menu>
      <div v-if="hasAttach" class="icon_button" @click="toggleSensitive"
      :class="{enable: sensitive}">
        <icon name="exclamation-triangle"></icon>
      </div>
      <div class="icon_button" :class="{enable: isEnableSpoiler}">
        <div class="cw" @click="toggleCW">CW</div>
      </div>
      <div class="counter" :class="{error: wordCount < 0}">{{ wordCount }}</div>
      <button @click="postToot" :disabled="!isTootable"> submit </button>
    </div>
  </div>
</template>

<script>
import { remote, clipboard } from 'electron'; // eslint-disable-line
import fs from 'fs'; // eslint-disable-line
import path from 'path'; // eslint-disable-line
import { mapState } from 'vuex';
import { Picker } from 'emoji-mart-vue';
import UploadMedia from './UploadMedia.vue';
import DropdownMenu from '../utils/DropdownMenu.vue';

export default {
  name: 'compose',
  data() {
    return {
      isOpenPicker: false,
      textAreaCursorPos: 0,
    };
  },
  components: {
    UploadMedia, DropdownMenu, Picker,
  },
  computed: {
    status: {
      get() {
        return this.$store.state.compose.status;
      },
      set(value) { this.$store.commit('UPDATE_TEXTAREA', value); },
    },
    spoiler_text: {
      get() {
        return this.$store.state.compose.spoiler_text;
      },
      set(value) { this.$store.commit('UPDATE_SPOILER', value); },
    },
    ...mapState({
      wordCount: state => 500 - state.compose.status.length - state.compose.spoiler_text.length,
      hasAttach: state => state.compose.attach.length > 0,
      isEnableSpoiler: state => state.compose.isEnableSpoiler,
      sensitive: state => state.compose.sensitive,
      isTootable: state => state.compose.isTootable && !state.compose.isUploading,
      reply: state => state.compose.reply,
      getVisibilityIcon(state) {
        const key = state.compose.visibility;
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
    }),
  },
  methods: {
    textareaKeydown(e) {
      // in textarea, press ctrl+enter to post
      if (e.isTrusted && e.key === 'Enter' && e.ctrlKey && !e.altKey && !e.altKey && !e.repeat) {
        this.postToot();
      }
    },
    textareaPaste(e) {
      if (e.clipboardData && e.clipboardData.types) {
        for (let i = 0; i < e.clipboardData.types.length; i += 1) {
          if (e.clipboardData.types[i] === 'Files') {
            this.$store.commit('SET_UPLOADING', true);
            const image = e.clipboardData.items[i].getAsFile();
            const filePath = path.join(remote.app.getPath('temp'), image.name);
            Promise.resolve(image)
            .then(resp => new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onError = e => reject(e);
              reader.readAsArrayBuffer(resp);
            }))
            .then(resp => new Promise((resolve, reject) => {
              fs.writeFile(filePath, new Buffer(resp), (err) => {
                if (err) return reject(err);
                return resolve();
              });
            }))
            .then(() => this.$store.dispatch('uploadMedia', filePath))
            .then(() => new Promise((resolve, reject) => {
              fs.unlink(filePath, (err) => {
                if (err) reject(err);
                resolve();
              });
            }))
            .catch((err) => {
              console.log(err);
            })
            .then(() => {
              this.$store.commit('SET_UPLOADING', false);
            });
            return;
          }
        }
      }
    },
    textareaBlur(e) {
      this.textAreaCursorPos = e.target.selectionEnd;
    },
    clickPickerIcon(e) {
      e.preventDefault();
      this.isOpenPicker = !this.isOpenPicker;
    },
    pickEmoji(emoji) {
      this.isOpenPicker = false;
      this.$store.commit('ADD_TEXTAREA', { word: emoji.native, pos: this.textAreaCursorPos });
      this.textAreaCursorPos += emoji.colons.length;
    },
    postToot() {
      this.$store.dispatch('postToot');
    },
    openFileDialog() {
      const path = remote.dialog.showOpenDialog(remote.BrowserWindow.getFocusedWindow(), {
        title: 'select upload media',
        filters: [
          { name: 'Media', extensions: ['jpg', 'png', 'gif', 'mp4'] },
        ],
        properties: ['openFile'],
      });
      if (path !== undefined) {
        this.$store.commit('SET_UPLOADING', true);
        this.$store.dispatch('uploadMedia', path[0])
        .catch((err) => {
          console.log(err);
        })
        .then(() => {
          this.$store.commit('SET_UPLOADING', false);
        });
      }
    },
    visibilityChange(key) {
      this.$store.commit('CHANGE_VISIBILITY', key);
    },
    toggleCW() {
      this.$store.commit('TOGGLE_SPOILER');
    },
    toggleSensitive() {
      this.$store.commit('TOGGLE_SENSITIVE');
    },
    clearReply() {
      this.$store.dispatch('clearReply');
    },
  },
};
</script>

<style lang="scss">
@import "../_variables";

.reply {
  .content {
    width: 100%;
    font-size: x-small !important;
    p,a {
      margin: 0.2em 0;
      word-break: break-all;
    }
  }
}
</style>

<style lang="scss" scoped>
  @import "../_variables";
  @mixin ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  #compose {
    background-color: $content-bg-color;
    border-radius: 5px;
    padding: 5px;
    .reply {
      margin: 1px;
      padding-bottom: 1em;
      .title {
        display: flex;
        color: $success-color;
        .close {
          cursor: pointer;
          margin-left: auto;
          color: $hidden-color;
        }
      }
      .name {
        @include ellipsis;
        :last-child {
          font-size: x-small;
        }
      }
    }
    .spoiler {
      margin:0px;
      margin-bottom: 5px;
      background-color: white;
      padding: 5px;
      input {
        width: 100%;
      }
    }
    .inputarea {
      background-color: white;
      padding: 5px;
      .text_container {
        display: flex;
        .text{
          textarea {
            resize: none;
            overflow:hidden;
            width: 205px;
          }
        }
        .picker_container{
          .icon {
            color: $hidden-color;
            cursor: pointer;
          }
          .picker {
            position: absolute;
            z-index: 500;
          }
          .picker_bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 499;
          }
        }
      }
    }
    .control{
      height: 25px;
      display: flex;
      align-items: center;
      margin-top: 10px;
      margin-bottom: 5px;
      .icon_button {
        cursor: pointer;
        padding: 0 8px;
        .cw {
          font-size: smaller;
          font-weight: bolder;
        }
        &.enable {
          color: $success-color;
        }
      }
      .dropdown {
        z-index: 9999;
        position: absolute;
        width: 180px;
        margin-top: 5px;
        margin-left: -15px;
        background-color: $content-bg-color;
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
      .counter {
        height: 25px;
        display: flex;
        align-items: center;
        font-size: small;
        font-weight: bold;
        margin-left: auto;
        &.error {
          color: $danger-color;
        }
      }
      button {
        margin-left: auto;
        padding: 5px 0.5em;

        color: darken($success-color, 50%);
        font-weight: bold;
        background-color: $success-color;

        &[disabled] {
          cursor: no-drop;
          color: lighten($hidden-color, 10%);
          background-color: $hidden-color;
        }
      }
    }
  }
</style>
