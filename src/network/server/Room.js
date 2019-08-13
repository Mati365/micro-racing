import * as R from 'ramda';

import {ERROR_CODES} from '@game/network/constants/serverCodes';

import {
  findByID,
  removeByID,
} from '@pkg/basic-helpers';

import ServerError from '../shared/ServerError';

export default class Room {
  constructor(
    {
      owner,
      name,
      kickedPlayers = [],
      players = [],
      playersLimit = 8,
      onDestroy,
    },
  ) {
    this.name = name;
    this.owner = owner;
    this.playersLimit = playersLimit;
    this.onDestroy = onDestroy;

    this.kickedPlayers = kickedPlayers;
    this.players = (
      owner
        ? [...players, owner]
        : players
    );
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
   */
  join(player) {
    const {
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

    this.players.push(player);
  }

  /**
   * Remove player from list
   *
   * @param {Player} player
   */
  leave(player) {
    this.players = removeByID(player.id, this.players);
    if (!this.playersCount)
      this.onDestroy?.(this);
  }
}
