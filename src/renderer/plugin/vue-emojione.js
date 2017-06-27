import emojione from 'emojione';

const sprites = require('emojione/assets/sprites/emojione.sprites.svg');

export default {
  install(Vue, options = {
    imageType: 'svg',
  }) {
    Object.assign(emojione, options);
    if (emojione.imageType === 'svg') {
      emojione.imagePathSVGSprites = sprites;
    }

    const emoji = (value, method = 'toImage') => emojione[method](value);

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
          el.innerHTML = emoji(dom.innerHTML);
        }
      },
    });
  },
};
