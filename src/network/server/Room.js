import * as R from 'ramda';

import {ERROR_CODES} from '@game/network/constants/serverCodes';

import {getByID} from '@pkg/basic-helpers';
import ServerError from '../shared/ServerError';

export default class Room {
  constructor(
    {
      owner,
      kickedPlayers = [],
      players = [],
      playersLimit = 8,
    },
  ) {
    this.owner = owner;
    this.kickedPlayers = kickedPlayers;
    this.playersLimit = playersLimit;
    this.players = [
      ...players,
      owner,
    ];
  }

  get isFull() {
    return this.playersLimit === this.players.length - 1;
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
    if (getByID(id, players)?.id === player.id)
      throw new ServerError(ERROR_CODES.ALREADY_JOINED);

    if (getByID(id, kickedPlayers)?.id === player.id)
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
    this.players = R.without(
      [player],
      this.players,
    );
  }
}
