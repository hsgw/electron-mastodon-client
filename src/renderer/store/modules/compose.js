import { COMPOSE } from '../mutation-types.js';

const state = {
  status: '',
  attach: [],
  defaultVisiblity: 'public',
  visibility: 'public',
  spoiler_text: '',
  sensitive: false,
  isEnableSpoiler: false,
  isTootable: false,
  isUploading: false,
  reply: {},
};

const valid = status => (status.replace(/\s+/g, '').length > 0);

const mutations = {
  [COMPOSE.UPDATE_TEXTAREA](state, text) {
    state.status = text;
    state.isTootable = valid(state.status);
  },
  [COMPOSE.ADD_TEXTAREA](state, { word, pos = 0 }) {
    console.log(pos);
    const before = state.status.substr(0, pos);
    const after = state.status.substr(pos, state.status.length);
    state.status = before + word + after;
    state.isTootable = valid(state.status);
  },
  [COMPOSE.CLEAR_TOOT](state) {
    state.status = '';
    state.attach = [];
    state.visibility = state.defaultVisiblity;
    state.spoiler_text = '';
    state.sensitive = false;
    state.isEnableSpoiler = false;
    state.isTootable = false;
    state.reply = {};
  },
  [COMPOSE.SET_DEFAULT_VISIBLITY](state, visibility) {
    state.defaultVisiblity = visibility;
    state.visibility = visibility;
  },
  [COMPOSE.SET_UPLOADING](state, flag) {
    state.isUploading = flag;
  },
  [COMPOSE.ADD_ATTACH](state, media) {
    state.attach.push(media);
    state.status += ` ${media.text_url}`;
    state.isTootable = valid(state.status);
  },
  [COMPOSE.DELETE_ATTACH](state, id) {
    const deleted = state.attach.filter(v => v.id === id);
    state.attach = state.attach.filter(v => v.id !== id);
    const regExp = new RegExp(` ${deleted[0].text_url}`, '');
    state.status = state.status.replace(regExp, '');
    state.isTootable = valid(state.status);
  },
  [COMPOSE.TOGGLE_SENSITIVE](state) {
    state.sensitive = !state.sensitive;
  },
  [COMPOSE.CHANGE_VISIBILITY](state, visibility) {
    state.visibility = visibility;
  },
  [COMPOSE.UPDATE_SPOILER](state, text) {
    state.spoiler_text = text;
  },
  [COMPOSE.TOGGLE_SPOILER](state) {
    if (state.isEnableSpoiler) state.spoiler_text = '';
    state.isEnableSpoiler = !state.isEnableSpoiler;
  },
  [COMPOSE.MAKE_REPLY](state, reply) {
    state.reply = reply;
    state.status = `@${reply.account.acct} ${state.status}`;
  },
  [COMPOSE.CLEAR_REPLY](state) {
    if (state.reply.account != null) {
      const regExp = new RegExp(`@${state.reply.account.acct} `, '');
      state.status = state.status.replace(regExp, '');
    }
    state.reply = {};
  },
};

export default {
  state,
  mutations,
};
