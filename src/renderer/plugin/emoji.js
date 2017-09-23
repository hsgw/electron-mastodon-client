import twemoji from 'twemoji';

export default {
  install(Vue) {
    Vue.directive('emoji-render', {
      inserted(el, binding) {
        // Focus the element
        if (binding.value != null) {
          const dom = document.createElement('div');
          dom.innerHTML = binding.value;
          const mentions = dom.getElementsByClassName('mention');
          for (let i = 0; i < mentions.length; i += 1) {
            mentions[i].setAttribute('target', '_blank');
          }
          el.innerHTML = dom.innerHTML;
          twemoji.parse(el, { class: 'emoji' });
        }
      },
    });
  },
};
