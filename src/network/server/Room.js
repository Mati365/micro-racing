import * as R from 'ramda';

import PLAYERS_COLORS from '@game/network/constants/playersColors';
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

import ServerError from '../shared/ServerError';
import RoomRacing from './RoomRacing';
import {PlayerBot} from './Player/types';
import {PlayerRacingState} from './Player/PlayerInfo';

export default class Room {
  constructor(
    {
      options = {
        spawnBotsBeforeStart: true,
      },
      owner,
      name,
      map,
      abstract, // its only virtual represenation of list of players
      kickedPlayers = [],
      players = [],
      playersLimit = 5,
      onDestroy,
    },
  ) {
    this.options = options;
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

  startRace() {
    const {spawnBotsBeforeStart} = this.options;

    if (this.abstract)
      return;

    if (spawnBotsBeforeStart) {
      this.spawnBots(
        Math.max(0, this.playersLimit - this.players.length - 1),
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
  getBroadcastSocketJSON() {
    const {
      name, owner,
      racing, players,
    } = this;

    return {
      name,
      ownerID: owner.info.id,
      players: R.map(
        ({info}) => info.getBroadcastSocketJSON(),
        players,
      ),

      // objects
      ...racing.map.getBroadcastSocketJSON(),
    };
  }

  /**
   * Generates color based on players list
   *
   * @returns {String}
   */
  genUniquePlayerColor() {
    return R.compose(
      arr => arr[0].templateColor,
      R.sortWith([
        R.ascend(R.prop('occurrences')),
      ]),
      R.map(
        (templateColor) => {
          const occurrences = R.reduce(
            (acc, player) => acc + +(player.info.racingState?.color === templateColor),
            0,
            this.players,
          );

          return {
            occurrences,
            templateColor,
          };
        },
      ),
    )(PLAYERS_COLORS);
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
    return this.playersLimit === this.playersCount - 1;
  }

  get isEmpty() {
    return !this.playersCount;
  }

  /**
   * Adds multiple bots to room and broadcast it
   *
   * @param {Number} count
   */
  spawnBots(count) {
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
        );
      },
      count,
    );

    return true;
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
      const playerCar = this.racing.map.appendPlayerCar(player);

      Object.assign(
        player.info,
        {
          car: playerCar,
          room: this,
          racingState: new PlayerRacingState(
            {
              color: this.genUniquePlayerColor(),
            },
          ),
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

    if (this.isEmpty || this.bots.length === this.players.length)
      this.destroy();
  }
}
