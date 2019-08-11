import WebSocket from 'ws';
import consola from 'consola';

import {logMethod} from '@pkg/basic-helpers';
import PlayerSocket from './PlayerSocket';

/**
 * Main networking class
 */
export default class GameServer {
  constructor({
    socketOptions = {
      port: 8080,
      perMessageDeflate: false,
    },
  } = {}) {
    this.socketOptions = socketOptions;
    this.rooms = [];
  }

  /**
   * Run server, wait for connections and assign users to rooms
   */
  @logMethod(
    ({socketOptions}) => {
      consola.info(`Starting websocket server at ${socketOptions.port}!`);
    },
  )
  start() {
    const {socketOptions} = this;

    this.wss = new WebSocket.Server(socketOptions);
    this.wss.binaryType = 'arraybuffer';

    this.wss.on(
      'connection',
      ws => new PlayerSocket(
        {
          gameServer: this,
          ws,
        },
      ),
    );
  }

  /**
   * Kills websocket server
   */
  stop() {
    this.wss.close();
  }
}
