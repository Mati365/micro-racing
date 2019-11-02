import WebSocket from 'ws';
import consola from 'consola';
import chalk from 'chalk';

import {removeByProp} from '@pkg/basic-helpers/list/removeByID';
import {findByProp} from '@pkg/basic-helpers/list/findByID';
import {getRandomObjValue} from '@pkg/basic-helpers/base/random';
import {logMethod} from '@pkg/basic-helpers';

import PlayerSocket from './PlayerSocket';
import Room from './Room';
import ServerError from '../shared/ServerError';

import {ERROR_CODES} from '../constants/serverCodes';

/**
 * Main networking class
 */
export default class GameServer {
  constructor({
    maps,
    socketOptions = {
      port: 8080,
      perMessageDeflate: false,
    },
  } = {}) {
    this.maps = maps || {};
    this.socketOptions = socketOptions;

    /**
     * rootRoom is a room with all players
     * each player is assigned to id
     */
    this.rooms = [];
    this.rootRoom = new Room(
      {
        owner: null,
        abstract: true,
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
    const {socketOptions} = this;

    this.wss = new WebSocket.Server(socketOptions);
    this.wss.binaryType = 'arraybuffer';

    this.wss.on('connection', (ws) => {
      new PlayerSocket(
        {
          server: this,
          ws,
        },
      );
    });
  }

  /**
   * Kills websocket server
   */
  stop() {
    this.wss.close();
  }

  /**
   * ROOM API
   */
  findRoom(name) {
    return findByProp('name')(name, this.rooms);
  }

  /**
   * Remove room from rooms list by name
   *
   * @param {String} name
   */
  @logMethod(
    (_, name) => {
      consola.info(`Remove room ${chalk.green.bold(name)}!`);
    },
  )
  removeRoom(name) {
    this.rooms = removeByProp('name')(name, this.rooms);
  }

  /**
   * Create room on server with owner flag and onDestroy handler
   *
   * @param {Object} config
   */
  @logMethod(
    (_, {name, owner}) => {
      consola.info(`Create room ${chalk.green.bold(name)} by ${chalk.white.bold(owner.info.nick)}!`);
    },
  )
  createRoom({name, owner}) {
    if (this.findRoom(name))
      throw new ServerError(ERROR_CODES.ROOM_ALREADY_EXISTS);

    const room = new Room(
      {
        owner,
        name,
        map: getRandomObjValue(this.maps),
        onDestroy: () => this.removeRoom(name),
      },
    );

    this.rooms.push(room);
    return room;
  }
}
