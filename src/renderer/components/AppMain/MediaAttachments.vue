<template>
  <div>
    <div class="media_wrappaer" v-if="attachments.length">
      <div class="sensitive" @click.stop="toggleSensitive" v-show="isOpenSensitive"><span>非表示のメディア</span><span>クリックして表示</span></div>
      <button @click.stop="toggleSensitive"><icon name="exclamation-triangle" scale="0.8"></icon></button>
      <div v-for="(image, index) in attachments" class="thumb_wrappaer" :key="image.id">
        <div v-if="image.type === 'gifv'" class="thumb" @click="toggleLightbox(index)">
          <video autoplay loop :src="image.url"></video>
        </div>
        <div v-else-if="image.type === 'video'" class="thumb video" :style="{ backgroundImage: 'url(' + image.preview_url + ')' }" @click="toggleLightbox(index)">
          <div><icon name="video-camera" scale="2" class="icon"></icon></div>
        </div>
        <div v-else class="thumb" :style="{ backgroundImage: 'url(' + image.preview_url + ')' }" @click="toggleLightbox(index)"></div>
      </div>
      <div v-if="isOpenLightbox" class="lightbox" @click="toggleLightbox()">
        <div class="media">
          <video v-if="attachments[currentLightboxIndex].type === 'video'" :src="attachments[currentLightboxIndex].url" controls autoplay></video>
          <video v-else-if="attachments[currentLightboxIndex].type === 'gifv'" :src="attachments[currentLightboxIndex].url" autoplay loop muted></video>
          <img v-else :src="attachments[currentLightboxIndex].preview_url"></img>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'media-attachments',
  props: ['attachments', 'sensitive'],
  data() {
    return {
      isOpenSensitive: !this.sensitive,
      isOpenLightbox: false,
      currentLightboxIndex: 0,
    };
  },
  components: {
  },
  computed: {
    ...mapState({
    }),
  },
  methods: {
    toggleSensitive() {
      this.isOpenSensitive = !this.isOpenSensitive;
    },
    toggleLightbox(index) {
      if (!this.isOpenLightbox) {
        this.currentLightboxIndex = index;
      }
      this.isOpenLightbox = !this.isOpenLightbox;
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../_variables";

  .media_wrappaer {
    display: flex;
    margin-top: 0.5em;
    width: 100%;
    height: 120px;
    .sensitive {
      background: black;
      cursor: pointer;
      width: 100%;
      height: 100%;
      z-index:100;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      span:last-child {
        font-size: x-small;
      }
    }
    button {
      position: absolute;
      margin-top: 5px;
      margin-left: 5px;
      width: 25px;
      height: 25px;
      cursor: pointer;
      color: white;
      background-color: $bg-color;
      opacity: 0.8;
      z-index:99;
      :first-child {
        position: relative;
        top: 2px;
      }
    }
    .thumb_wrappaer {
      flex: 1;
      margin: 2px;
      z-index:97;
      .thumb {
        display: flex;
        justify-content: center;
        flex-direction: column;
        text-align: center;
        overflow: hidden;
        background-position: 50%;
        background-repeat: no-repeat;
        background-size: cover;
        cursor: zoom-in;
        width: 100%;
        height: 100%;
        video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          top: 50%;
        }
        .icon {
          color:grey;
          opacity: 0.8;
        }
      }
    }
  }
  .lightbox {
    display: flex;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    background-color: rgba(0,0,0,0.8);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    .media {
      video, img {
        max-width:90%;
        max-height:90%;
      }
    }
  }
</style>
