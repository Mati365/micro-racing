import * as R from 'ramda';

import {
  ERROR_CODES,
  PLAYER_ACTIONS,
} from '@game/network/constants/serverCodes';

import {
  findByID,
  removeByID,
} from '@pkg/basic-helpers';

import createActionMessage from '../shared/utils/createActionMessage';

import ServerError from '../shared/ServerError';
import RoadMapObjectsManager from './RoadMapObjectsManager';

export default class Room {
  constructor(
    {
      owner,
      name,
      abstract, // its only virtual represenation of list of players
      kickedPlayers = [],
      players = [],
      playersLimit = 8,
      onDestroy,
    },
  ) {
    this.name = name;
    this.owner = owner;
    this.abstract = abstract;
    this.kickedPlayers = kickedPlayers;

    if (!abstract)
      this.map = new RoadMapObjectsManager;

    this.playersLimit = playersLimit;
    this.players = [];

    R.map(
      player => this.join(player, false),
      owner
        ? [...players, owner]
        : players,
    );

    this.onDestroy = onDestroy;
  }

  // eslint-disable-next-line
  startRace() {}

  /**
   * It is faster than sendBroadcastAction in real time events
   *
   * @param {Buffer} message
   */
  sendBinaryBroadcastMessage(message) {
    const {players} = this;

    for (let i = players.length - 1; i >= 0; --i)
      players[i].ws.send(message);
  }

  /**
   * Creates action message and broadcasts it to all players in room
   *
   * @param  {...any} params
   */
  sendBroadcastAction(...params) {
    this.sendBinaryBroadcastMessage(
      createActionMessage(...params),
    );
  }

  /**
   * Returns info about map
   */
  getBroadcastSocketJSON() {
    const {
      name, owner,
      map, players,
    } = this;

    return {
      name,
      ownerID: owner.info.id,
      players: R.map(
        ({info}) => info.getBroadcastSocketJSON(),
        players,
      ),

      // objects
      ...map.getBroadcastSocketJSON(),
    };
  }

  get playersCount() {
    return this.players.length;
  }

  get isFull() {
    return this.playersLimit === this.playersCount - 1;
  }

  /**
   * Appends player to room players,
   * if owner is null(which should never happen) set it as owner
   *
   * @param {Player} player
   * @param {Boolean} broadcast
   */
  join(player, broadcast = true) {
    const {
      abstract,
      kickedPlayers,
      players,
    } = this;

    if (this.isFull)
      throw new ServerError(ERROR_CODES.ROOM_FULL);

    const {id} = player;
    if (findByID(id, players))
      throw new ServerError(ERROR_CODES.ALREADY_JOINED);

    if (findByID(id, kickedPlayers))
      throw new ServerError(ERROR_CODES.ALREADY_KICKED);

    if (R.isNil(this.owner))
      this.owner = player;

    // broadcast it to all players, exclude added
    if (!abstract) {
      const playerCar = this.map.appendPlayerCar(player);

      Object.assign(
        player.info,
        {
          room: this,
          car: playerCar,
        },
      );

      broadcast && this.sendBroadcastAction(
        null,
        PLAYER_ACTIONS.PLAYER_JOINED_TO_ROOM,
        null,
        {
          player: player.getBroadcastSocketJSON(),
          car: playerCar,
        },
      );
    }

    // append player to list and create car object
    this.players.push(player);
  }

  /**
   * Remove player from list
   *
   * @param {Player} player
   * @param {Boolean} broadcast
   */
  leave(player, broadcast = true) {
    const {abstract} = this;

    this.players = removeByID(player.id, this.players);

    if (!abstract) {
      this.map.removePlayerCar(player);
      Object.assign(
        player.info,
        {
          room: null,
          car: null,
        },
      );

      broadcast && this.sendBroadcastAction(
        null,
        PLAYER_ACTIONS.PLAYER_LEFT_ROOM,
        null,
        {
          player: player.getBroadcastSocketJSON(),
        },
      );
    }

    if (!this.playersCount)
      this.onDestroy?.(this);
  }
}
