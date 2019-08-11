import * as R from 'ramda';

import {ERROR_CODES} from '@game/network/constants/serverCodes';

import {getByID} from '@pkg/basic-helpers';
import ServerError from '../shared/ServerError';

export default class Room {
  constructor(
    {
      owner,
      name,
      kickedPlayers = [],
      players = [],
      playersLimit = 8,
    },
  ) {
    this.name = name;
    this.owner = owner;
    this.playersLimit = playersLimit;

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
    if (getByID(id, players))
      throw new ServerError(ERROR_CODES.ALREADY_JOINED);

    if (getByID(id, kickedPlayers))
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
    this.players = R.reject(
      R.propEq('id', player.id),
      this.players,
    );
  }
}
