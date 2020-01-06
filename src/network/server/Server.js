import WebSocket from 'ws';
import consola from 'consola';
import chalk from 'chalk';

import {getRandomObjValue} from '@pkg/basic-helpers/base/random';
import {
  logMethod,
  findByID,
  removeByID,
} from '@pkg/basic-helpers';

import PlayerSocket from './Player/types/PlayerSocket';
import Room from './Room';
import ServerError from '../shared/ServerError';
import {RoomConfig} from '../shared/room';

import {SERVER_PORT} from '../constants/runtimeConfig';
import {
  PLAYER_ACTIONS,
  ERROR_CODES,
} from '../constants/serverCodes';

import {
  serializeServerError,
  createActionMessage,
} from '../shared/utils';

/**
 * Main networking class
 */
export default class GameServer {
  constructor(
    {
      maps,
      neurals,
      playersLimit = 64,
      socketOptions = {
        port: SERVER_PORT,
        perMessageDeflate: false,
      },
      onDumpTrainingPopulation,
      onDumpTrackRecord,
    } = {},
  ) {
    this.neurals = neurals;
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
        config: new RoomConfig(
          {
            playersLimit,
          },
        ),
      },
    );

    this.onDumpTrainingPopulation = onDumpTrainingPopulation;
    this.onDumpTrackRecord = onDumpTrackRecord;
  }

  /**
   * Run server, wait for connections and assign users to rooms
   */
  @logMethod(
    () => {
      consola.info('Starting websocket server!');
    },
  )
  start() {
    const {socketOptions} = this;

    this.wss = new WebSocket.Server(socketOptions);
    this.wss.binaryType = 'arraybuffer';

    this.wss.on('connection', (ws, req) => {
      try {
        new PlayerSocket(
          {
            server: this,
            ip: req.connection.remoteAddress,
            ws,
          },
        );
        ws.send(
          createActionMessage(
            null,
            PLAYER_ACTIONS.CONNECTION_SUCCESS,
            null,
            {},
          ),
        );
      } catch (e) {
        ws.send(
          createActionMessage(
            null,
            PLAYER_ACTIONS.CONNECTION_ERROR,
            null,
            serializeServerError(e),
          ),
        );
        ws.close();
      }
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
  findRoom(id) {
    return findByID(id, this.rooms);
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
  removeRoom(roomId) {
    this.rooms = removeByID(roomId, this.rooms);
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
  createRoom(
    {
      name,
      owner,
    },
  ) {
    if (this.findRoom(name))
      throw new ServerError(ERROR_CODES.ROOM_ALREADY_EXISTS);

    const room = new Room(
      {
        server: this,
        owner,
        name,
        map: getRandomObjValue(this.maps),
        onDestroy: () => this.removeRoom(room.id),
      },
    );

    const {
      spawnBots,
      playersLimit,
      aiTraining,
      recordHumanRace,
    } = room.config;

    if (spawnBots)
      room.spawnBots(playersLimit - 1);

    if (aiTraining)
      room.racing.aiTrainer.observers.bestNeuralItems.subscribe(this.onDumpTrainingPopulation);

    if (recordHumanRace)
      room.racing.recorder.observers.recordedCar.subscribe(this.onDumpTrackRecord);

    this.rooms.push(room);
    return room;
  }
}
