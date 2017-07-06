import { AUTH } from '../mutation-types.js';

const state = {
  appName: 'ひきこもり',
  appUrl: 'https://github.com/hsgw/electron-mastodon-client',
  serverURL: '',
  clientID: '',
  clientSeclet: '',
  authURL: '',
  accessToken: '',
};

const mutations = {
  [AUTH.LOAD_DATA](state, payload) {
    state.serverURL = payload.serverURL;
    state.clientID = payload.clientID;
    state.clientSeclet = payload.clientSeclet;
    state.accessToken = payload.accessToken;
  },

  [AUTH.SET_CLIENTID](state, payload) {
    state.serverURL = payload.serverURL;
    state.clientID = payload.clientID;
    state.clientSeclet = payload.clientSeclet;
  },

  [AUTH.SET_AUTH_URL](state, payload) {
    state.authURL = payload.authURL;
  },

  [AUTH.SET_ACCESS_TOKEN](state, payload) {
    state.accessToken = payload.accessToken;
  },

  [AUTH.CLEAR_AUTH](state) {
    state.serverURL = '';
    state.clientID = '';
    state.clientSeclet = '';
    state.authURL = '';
    state.accessToken = '';
  },
};

export default {
  state,
  mutations,
};
