import storage from 'electron-json-storage';
import Mastodon from 'mastodon-api';
import * as types from './mutation-types';
import Client from '../utils/mastodonClient';
import router from '../router';


let CONFIG_NAME_AUTH;

if (process.env.NODE_ENV !== 'development') {
  CONFIG_NAME_AUTH = 'mastodon_auth';
} else {
  CONFIG_NAME_AUTH = 'mastodon_auth_dev';
}

let client;

export const initAuthorizeData = ({ commit }) =>
new Promise((resolve, reject) => {
  storage.get(CONFIG_NAME_AUTH, (err, data) => {
    if (!err && data.serverURL && data.accessToken) {
      commit(types.AUTH.LOAD_DATA, data);
      return resolve();
    }
    return reject();
  });
});

export const requestAuthURL = ({ state, commit }, serverURL) => {
  const { auth } = state;
  return Mastodon.createOAuthApp(`${serverURL}/api/v1/apps`, auth.appName, 'read write follow')
    .then((res) => {
      commit(types.AUTH.SET_CLIENTID,
      { serverURL, clientID: res.client_id, clientSeclet: res.client_secret });
      return Mastodon.getAuthorizationUrl(auth.clientID, auth.clientSeclet, auth.serverURL);
    })
    .then((res) => {
      commit(types.AUTH.SET_AUTH_URL, { authURL: res });
      return Promise.resolve();
    });
};

export const requestAccessToken = ({ state, commit, dispatch }, authCode) => {
  const { clientID, clientSeclet, serverURL } = state.auth;
  return Mastodon.getAccessToken(clientID, clientSeclet, authCode, serverURL)
  .then((accessToken) => {
    commit(types.AUTH.SET_ACCESS_TOKEN, { accessToken });
    return new Promise((resolve, reject) => {
      storage.set(CONFIG_NAME_AUTH, { clientID, clientSeclet, serverURL, accessToken }, (err) => {
        if (err) {
          return reject(err);
        }
        router.push('/');
        return resolve();
      });
    });
  });
};

const fetchAllStatuses = maxID =>
  Promise.all([client.getLocalTimeLine(maxID), client.getHomeTimeLine(maxID)])
  .then((resp) => {
    const toots = resp[0].data.concat(resp[1].data);
    toots.sort((a, b) => {
      if (a.id > b.id) return -1;
      if (a.id < b.id) return 1;
      return 0;
    });
    for (let i = 1; i < toots.length; i += 1) {
      if (toots[i].id === toots[i - 1].id) toots.splice(i, 1);
    }
    return Promise.resolve(toots);
  });

export const refreshAllStatuses = ({ commit }) =>
   fetchAllStatuses()
   .then((resp) => {
     commit(types.MASTODON.RESET_TOOTS, resp);
     Promise.resolve();
   });

export const fetchPrevStatuses = ({ state, commit }) => {
  if (state.mastodon.isFetchingPrevToots) return Promise.resolve();
  commit(types.MASTODON.FETCHING_PREV_TOOTS);
  const maxID = state.mastodon.toots[state.mastodon.toots.length - 1].id;
  return fetchAllStatuses(maxID)
  .then((res) => {
    commit(types.MASTODON.SET_PREV_TOOTS, res);
    return Promise.resolve();
  });
};

export const getNotifications = ({ commit }) => client.getNotifications()
.then((resp) => {
  commit('RESET_NOTIFICATION', resp.data);
  return Promise.resolve();
});

export const login = ({ commit, state, dispatch }) => { // eslint-disable-line
  console.log('login');
  console.log(`server: ${state.auth.serverURL}\naccess_token: ${state.auth.accessToken}`);

  const config = {
    access_token: state.auth.accessToken,
    api_url: `${state.auth.serverURL}/api/v1/`,
  };
  client = new Client(config);

  return client.setupStream()
  .then(() => dispatch('getMyAccount'))
  .then(() => dispatch('refreshAllStatuses'))
  .then(() => dispatch('getNotifications'))
  .then(() => {
    client.startLocalStream(
      ({ event, data }) => {
        switch (event) {
          case 'update':
            data.statusFrom = 'local';
            commit(types.MASTODON.ADD_TOOTS, data);
            break;
          case 'delete':
            commit(types.MASTODON.DELETE_TOOTS, data);
            break;
          default:
            console.log('unknown Event on localStream');
        }
      },
      (data) => {
        console.log(data);
      },
    );
    client.startUserStream(
      ({ event, data }) => {
        switch (event) {
          case 'update':
            data.statusFrom = 'local';
            commit(types.MASTODON.ADD_TOOTS, data);
            break;
          case 'delete':
            commit(types.MASTODON.DELETE_TOOTS, data);
            break;
          case 'notification':
            commit(types.MASTODON.ADD_NOTIFICATION, data);
            break;
          default:
            console.log('unknown Event on localStream');
        }
      },
      (data) => {
        console.log(data);
      },
    );
  });
};

export const logout = ({ commit }) => {
  client.stopStreams();
  storage.remove(CONFIG_NAME_AUTH, (err) => {
    if (err) console.log(err);
    commit(types.AUTH.CLEAR_AUTH);
    commit(types.MASTODON.LOGOUT_MASTODON);
    router.push('auth');
  });
};

export const getMyAccount = ({ commit }) => new Promise((resolve, reject) => {
  client.getMyAccount()
  .then((res) => {
    commit(types.MASTODON.SET_MY_ACCOUNT, res.data);
    resolve(res.data);
  },
  ((err) => {
    commit(types.MASTODON.SET_MY_ACCOUNT, {});
    reject(err);
  }));
});

export const updateTextarea = ({ commit }, text) => {
  commit(types.COMPOSE.UPDATE_TEXTAREA, text);
};

export const postToot = ({ commit, state }) => {
  const toot = {
    status: state.compose.status,
    visibility: state.compose.visibility,
    spoiler_text: state.compose.spoiler_text,
    sensitive: state.compose.sensitive,
  };
  if (state.compose.attach.length > 0) {
    toot.media_ids = state.compose.attach.map(v => v.id);
  }
  if (state.compose.reply.id != null) {
    toot.in_reply_to_id = state.compose.reply.id;
  }
  client.postToot(toot);
  commit(types.COMPOSE.CLEAR_TOOT);
};

export const deleteToot = ({ state }, id) => {
  client.deleteToot(id)
  .then(() => {
  });
};

export const uploadMedia = ({ commit, state }, path) => new Promise((resolve, reject) => {
  if (state.compose.attach.length > 3) {
    reject(new Error('too many media!'));
    return;
  }
  client.uploadMedia(path).then((res) => {
    commit(types.COMPOSE.ADD_ATTACH, res.data);
    resolve(res.data);
  }, (err) => {
    reject(err);
  });
});

export const deleteAttach = ({ commit }, id) => {
  commit(types.COMPOSE.DELETE_ATTACH, id);
};

export const reply = ({ commit }, reply) => {
  commit(types.COMPOSE.CLEAR_REPLY);
  commit(types.COMPOSE.MAKE_REPLY, reply);
};

export const clearReply = ({ commit }) => {
  commit(types.COMPOSE.CLEAR_REPLY);
};

export const favorite = ({ commit }, { id, uri, flag = true }) => client.favorite(id, flag)
.then(() => {
  commit(types.MASTODON.SET_FAVORITE, { uri, flag });
  return Promise.resolve();
});

export const boost = ({ commit }, { id, uri, flag = true }) =>
client.boost(id, flag)
.then(() => {
  commit(types.MASTODON.SET_BOOST, { uri, flag });
  return Promise.resolve();
});
