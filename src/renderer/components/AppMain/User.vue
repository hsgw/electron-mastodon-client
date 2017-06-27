<template>
  <div class="user">
    <img :src="user.avatar" />
    <div class="name" v-if="user.display_name != null">
      <div class="displayname" v-emoji-render:html="user.display_name">
      </div>
      <div class="username">
        {{ '@'+user.username }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'user',
  data() {
    return {};
  },
  computed: {
    user() {
      return this.$store.state.mastodon.myAccount;
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../_variables";
  .user {
    padding: 5px;
    margin-bottom: 10px;
    background-color: $content-bg-color;
    display: flex;
    height: 42px;
    border-radius: 5px;
    img{
      width:42px;
      height:42px;
    }
    .name {
      width: 200px;
      padding: 0 5px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      div {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .username {
        margin-left: 0.5em;
        font-size: x-small;
      }
    }
  }
</style>
