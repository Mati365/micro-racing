import consola from 'consola';

import PlayerInfo from './PlayerInfo';

/**
 * Socket API provider for player
 */
export default class PlayerSocket {
  constructor({
    socket,
    info = new PlayerInfo,
  }) {
    this.socket = socket;
    this.info = info;

    console.log(info);
    this.mountSocketListeners();
  }

  mountSocketListeners() {
    consola.info(`Welcome player ${this.info.nick}!`);
  }
}
