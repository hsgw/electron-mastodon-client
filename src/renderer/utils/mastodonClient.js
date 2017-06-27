/* eslint no-underscore-dangle:1 */

import fs from 'fs';
import { URL } from 'url';
import WebSocket from 'ws';
import querrystring from 'querystring';
import Mastodon from 'mastodon-api';

export default class Client {
  constructor(config) {
    this.mastodon = new Mastodon(config);
    this.accessToken = config.access_token;
    this.streamingApi = undefined;
    this.streams = [];
  }

  _startStream = (stream, message, error) => {
    const apiURL = new URL(`${this.streamingApi}/api/v1/streaming`);
    apiURL.search = querrystring.stringify({
      access_token: this.accessToken,
      stream,
    });
    const ws = new WebSocket(apiURL.toString());
    ws.on('open', () => {
      this.streams.push(ws);
    });

    ws.on('close', (code, reason) => {
      console.error(`s:close ${code} ${reason}`);
      if (code === 1006) {
        // callback();
      }
    });
    ws.on('error', err => error(err));
    ws.on('message', (resp) => {
      const json = JSON.parse(resp);
      let data;
      if (json.event === 'update' || json.event === 'notification') data = JSON.parse(json.payload);
      else data = json.payload;
      message({ event: json.event, data });
    });
  }

  getLocalTimeLine = (sinceID = 0, limit = 40) => this.mastodon.get('timelines/public', { local: '', since_id: sinceID, limit });

  getHomeTimeLine = (sinceID = 0, limit = 40) => this.mastodon.get('timelines/home', { home: '', since_id: sinceID, limit });

  getNotifications = (sinceID = 0, limit = 40) => this.mastodon.get('notifications', { since_id: sinceID, limit });

  getMyAccount = () => this.mastodon.get('accounts/verify_credentials');

  getInstance = () => this.mastodon.get('/instance');

  setupStream = () => this.getInstance()
    .then((resp) => {
      this.streamingApi = resp.data.urls.streaming_api;
      if (!this.streamingApi) return Promise.reject(new Error('can\'t get streaming API'));
      return Promise.resolve(resp);
    })

  startLocalStream = (message, error) => {
    this._startStream('public:local', message, error);
  }

  startUserStream = (success, error) => {
    this._startStream('user', success, error);
  }

  stopStreams = () => {
    this.streams.forEach((v) => {
      v.close();
    });
    this.streams = [];
  }

  postToot = status => this.mastodon.post('statuses', status);

  uploadMedia = path => this.mastodon.post('media', { file: fs.createReadStream(path) });

  uploadRawMedia = file => this.mastodon.post('media', { file });

  deleteToot = id => this.mastodon.delete(`statuses/${id}`);

  favorite = (id, flag = true) => {
    if (flag) return this.mastodon.post(`statuses/${id}/favourite`);
    return this.mastodon.post(`statuses/${id}/unfavourite`);
  };

  boost = (id, flag = true) => {
    if (flag) return this.mastodon.post(`statuses/${id}/reblog`);
    return this.mastodon.post(`statuses/${id}/unreblog`);
  };
}
