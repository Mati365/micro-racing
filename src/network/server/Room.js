import * as R from 'ramda';

import {
  PLAYER_TYPES,
  ERROR_CODES,
  PLAYER_ACTIONS,
} from '@game/network/constants/serverCodes';

import {
  hasFlag,
  findByID,
  removeByID,
} from '@pkg/basic-helpers';

import createActionMessage from '../shared/utils/createActionMessage';
import genUniquePlayerColor from './utils/genUniquePlayerColor';

import ServerError from '../shared/ServerError';
import RoomRacing from './RoomRacing';
import {RoomConfig} from '../shared/room';

import {PlayerBot} from './Player/types';
import {PlayerRacingState} from './Player/PlayerInfo';

export default class Room {
  constructor(
    {
      owner,
      name,
      map,
      abstract, // its only virtual represenation of list of players
      kickedPlayers = [],
      players = [],
      config = new RoomConfig,
      onDestroy,
    },
  ) {
    this.config = config;
    this.map = map;
    this.name = name;
    this.owner = owner;
    this.abstract = abstract;
    this.kickedPlayers = kickedPlayers;

    if (!abstract) {
      this.racing = new RoomRacing(
        {
          room: this,
        },
      );
    }

    this.players = [];

    R.map(
      player => this.join(player, false),
      owner
        ? [...players, owner]
        : players,
    );

    this.onDestroy = onDestroy;
  }

  startRace() {
    const {
      spawnBotsBeforeStart,
      playersLimit,
    } = this.config;

    if (this.abstract)
      return;

    if (spawnBotsBeforeStart) {
      this.spawnBots(
        Math.max(0, playersLimit - this.players.length - 1),
      );
    }

    this.racing.start();
  }

  destroy() {
    if (this.abstract)
      return;

    this.onDestroy?.(this);
    this.racing?.stop();
  }

  /**
   * It is faster than sendBroadcastAction in real time events
   *
   * @param {Buffer} message
   */
  sendBinaryBroadcastMessage(message) {
    const {players} = this;

    for (let i = players.length - 1; i >= 0; --i) {
      const player = players[i];
      if (player.ws)
        player.ws.send(message);
    }
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
  toBSON() {
    const {
      name, owner, config,
      racing, players,
    } = this;

    return {
      name,
      config: config.toBSON(),
      state: racing.getRaceState().toBSON(),
      ownerID: owner.info.id,

      // objects
      players: R.map(
        ({info}) => info.toBSON(),
        players,
      ),

      ...racing.map.toBSON(),
    };
  }

  get bots() {
    return R.filter(
      ({info}) => hasFlag(PLAYER_TYPES.BOT, info.kind),
      this.players,
    );
  }

  get playersCount() {
    return this.players.length;
  }

  get isFull() {
    return this.config.playersLimit === this.playersCount - 1;
  }

  get isEmpty() {
    return !this.playersCount;
  }

  /**
   * Adds multiple bots to room and broadcast it
   *
   * @param {Number} count
   */
  spawnBots(count, broadcast = true) {
    if (!count || count < 0 || this.isFull)
      return false;

    R.times(
      () => {
        this.join(
          new PlayerBot(
            {
              room: this,
            },
          ),
          broadcast,
        );
      },
      count,
    );

    return true;
  }

  /**
   * Sends playerInfo
   */
  broadcastPlayersRoomState() {
    this.sendBroadcastAction(
      null,
      PLAYER_ACTIONS.UPDATE_PLAYERS_ROOM_STATE,
      null,
      {
        players: this.players,
      },
    );
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
      racing,
    } = this;

    if (this.isFull)
      throw new ServerError(ERROR_CODES.ROOM_FULL);

    if (racing?.allowPlayerJoin === false)
      throw new ServerError(ERROR_CODES.RACING_ALREADY_ACTIVE);

    const {id} = player.info;
    if (findByID(id, players))
      throw new ServerError(ERROR_CODES.ALREADY_JOINED);

    if (findByID(id, kickedPlayers))
      throw new ServerError(ERROR_CODES.ALREADY_KICKED);

    if (R.isNil(this.owner))
      this.owner = player;

    // append player to list and create car object
    this.players.push(player);

    // broadcast it to all players, exclude added
    if (!abstract) {
      const playerCar = this.racing.map.appendPlayerCar(
        player,
        {
          ...racing.aiTrainer && {
            position: 0,
          },
        },
      );

      player.assignRoom(
        {
          car: playerCar,
          room: this,
          racingState: new PlayerRacingState(
            {
              color: genUniquePlayerColor(this.players),
            },
          ),
        },
      );

      broadcast && this.sendBroadcastAction(
        null,
        PLAYER_ACTIONS.PLAYER_JOINED_TO_ROOM,
        null,
        {
          player: player.toBSON(),
          car: playerCar,
        },
      );
    }
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
      this.racing.map.removePlayerCar(player);

      player.assignRoom(
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
          player: player.toBSON(),
        },
      );
    }

    if (this.isEmpty || this.bots.length === this.players.length)
      this.destroy();
  }
}
