import { MASTODON } from '../mutation-types.js';

const state = {
  myAccount: {},
  toots: [],
  notifications: [],
  isFetchingPrevToots: false,
  canDecreaseToots: false,
};

function searchByUri(toots, uri) {
  return toots.findIndex(elm => elm.uri === uri);
}

function searchByid(toots, id) {
  return toots.findIndex(elm => elm.id === id);
}

const mutations = {
  [MASTODON.SET_MY_ACCOUNT](state, payload) {
    state.myAccount = payload;
  },
  [MASTODON.RESET_TOOTS](state, payload) {
    state.toots = payload;
  },
  [MASTODON.ADD_TOOTS](state, payload) {
    const index = searchByid(state.toots, payload.id);
    if (index < 0) state.toots.unshift(payload);
    const length = state.toots.length;
    if (state.isFetchingPrevToots
        && state.canDecreaseToots
        && length > 80) {
      state.toots.splice(79, length - 80);
    }
  },
  [MASTODON.DELETE_TOOTS](state, key) {
    const index = searchByid(state.toots, key);
    if (index > -1) state.toots.splice(index, 1);
  },
  [MASTODON.SET_FAVORITE](state, { uri, flag }) {
    const index = searchByUri(state.toots, uri);
    if (index > -1) state.toots[index].favourited = flag;
  },
  [MASTODON.SET_BOOST](state, { uri, flag }) {
    const index = searchByUri(state.toots, uri);
    if (index > -1) state.toots[index].reblogged = flag;
  },
  [MASTODON.RESET_NOTIFICATION](state, data) {
    state.notifications = data;
  },
  [MASTODON.ADD_NOTIFICATION](state, data) {
    state.notifications.unshift(data);
  },
  [MASTODON.LOGOUT_MASTODON](state) {
    state.myAccount = {};
    state.toot = [];
    state.notifications = [];
  },
  [MASTODON.FETCHING_PREV_TOOTS](state) {
    state.isFetchingPrevToots = true;
  },
  [MASTODON.SET_PREV_TOOTS](state, data) {
    Array.prototype.push.apply(state.toots, data);
    state.isFetchingPrevToots = false;
  },
  [MASTODON.SET_CAN_DECREASE_TOOTS](state, flag) {
    state.canDecreaseToots = flag;
  },
};

export default {
  state,
  mutations,
};
