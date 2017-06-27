import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'AppIndex',
      component: require('@/components/AppIndex'),
    },
    {
      path: '/Auth',
      name: 'AppAuth',
      component: require('@/components/AppAuth'),
    },
    {
      path: '/main',
      name: 'AppMain',
      component: require('@/components/AppMain'),
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
