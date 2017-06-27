<template>
<div>
  <div v-if="isOpen || isUploading" @drop="onDrop" @dragover="isOnDragover = true" @dragleave="isOnDragover = false" @click="closeDropzone" class="dropzone" :class="{dropzone_on: isOnDragover}">
    <div v-if="!isUploading">
      <icon class="icon" name="upload" scale="1.2"></icon>&nbsp; Drop here!
    </div>
    <div v-else>
      <icon class="icon" name="circle-o-notch" scale="1.2" spin></icon>&nbsp; uploading...
    </div>
  </div>
  <div class="uploaded" v-if="attach.length > 0">
    <div v-for="item in attach">
      <div class="container">
        <img :src="item.preview_url">
        <div @click="onClickDelete(item.id)">
          <icon class="icon" name="close" scale="1.3"></icon>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'upload-media',
  data() {
    return {
      isOpen: false,
      isOnDragover: false,
    };
  },
  components: {
  },
  computed: {
    ...mapState({
      attach: state => state.compose.attach,
      isUploading: state => state.compose.isUploading,
    }),
  },
  methods: {
    onDrop(e) {
      e.stopPropagation();
      e.preventDefault();
      this.$store.commit('SET_UPLOADING', true);
      this.isOpen = false;
      const file = e.dataTransfer.files[0];
      if (file.type.indexOf('image/') === 0 || file.type === 'video/mp4') {
        this.$store.dispatch('uploadMedia', file.path)
        .then(() => {
          this.$store.commit('SET_UPLOADING', false);
        })
        .catch((err) => {
          console.log(err);
          this.$store.commit('SET_UPLOADING', false);
        });
      } else {
        this.$store.commit('SET_UPLOADING', false);
      }
    },
    closeDropzone(e) {
      e.preventDefault();
      this.isOpen = false;
      return false;
    },
    onClickDelete(e) {
      this.$store.dispatch('deleteAttach', e);
    },
  },
  created() {
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.isOpen = true;
      return false;
    });
    document.addEventListener('drop', (e) => {
      e.preventDefault();
      this.isOpen = false;
      return false;
    });
  },
};
</script>

<style lang="scss" scoped>
.dropzone {
  background-color: white;
  width: 100%;
  height: 100px;
  border: 5px;
  border-color: grey;
  box-sizing:border-box;
  border-style: dotted;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: large;
  .icon {
    position: relative;
    top: 3px;
  }
}
.dropzone_on {
  border-color: skyblue;
  border-style: solid;
}
.uploaded {
  width: 100%;
  flex-wrap: wrap;
  display: flex;
  .container{
    position: relative;
    img {
      margin: 5px;
      max-width:100px;
      max-height:100px;
    }
    .icon {
      position: absolute;
      top:5px;
      right: 10px;
      color: #777;
      cursor: pointer;
    }
  }
}

</style>
