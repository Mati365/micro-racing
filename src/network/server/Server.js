import WebSocket from 'ws';
import consola from 'consola';
import * as R from 'ramda';

import {logMethod} from '@pkg/basic-helpers';
import PlayerSocket from './PlayerSocket';
import Room from './Room';

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

    /**
     * rootRoom is a room with all players
     * each player is assigned to id
     */
    this.rooms = [];
    this.rootRoom = new Room(
      {
        owner: null,
      },
    );
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
    const {
      rootRoom,
      socketOptions,
    } = this;

    this.wss = new WebSocket.Server(socketOptions);
    this.wss.binaryType = 'arraybuffer';

    this.wss.on('connection', (ws) => {
      const playerSocket = new PlayerSocket(
        {
          gameServer: this,
          ws,
        },
      );

      rootRoom.join(playerSocket.info);
      playerSocket.onDisconnect = () => rootRoom.leave(playerSocket.info);
    });
  }

  /**
   * Kills websocket server
   */
  stop() {
    this.wss.close();
  }

  /**
   * User API
   */
  findRoom(name) {
    return R.find(
      R.propEq('name', name),
      this.rooms,
    );
  }
}
