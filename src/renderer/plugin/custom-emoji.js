export default {
  install(Vue) {
    Vue.directive('custom-emoji-render', {
      inserted(el, binding) {
        // Focus the element
        const emojis = binding.value.emojis;
        if (emojis != null) {
          if (binding.value.emojis.length > 0) {
            binding.value.emojis.forEach((emoji) => {
              const regexp = new RegExp(`:${emoji.shortcode}:`, 'g');
              const add = `<img class="emoji" alt=":${emoji.shortcode}:" title=":${emoji.shortcode}:" src="${emoji.url}">`;
              el.innerHTML = el.innerHTML.replace(regexp, add);
            }, this);
          }
        }
      },
    });
  },
};
