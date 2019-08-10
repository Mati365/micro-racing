export default class PlayerClientSocket {
  constructor({
    uri = 'ws://lvh.me:8080',
  } = {}) {
    this.uri = uri;
    this.ws = new WebSocket(uri);
  }
}
