import Vue from 'vue';
import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon';
import VueAutosize from 'vue-autosize';

import App from './App';
import router from './router';
import store from './store';

import VueEmojiOne from './plugin/vue-emojione';
import CustomEmoji from './plugin/custom-emoji';

Vue.component('icon', Icon);
Vue.use(VueAutosize);
Vue.use(VueEmojiOne);
Vue.use(CustomEmoji);

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');
