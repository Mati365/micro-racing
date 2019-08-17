import * as R from 'ramda';

import {ERROR_CODES} from '@game/network/constants/serverCodes';

import {
  findByID,
  removeByID,
} from '@pkg/basic-helpers';

import ServerError from '../shared/ServerError';
import RoadMap from './RoadMap';

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

    this.playersLimit = playersLimit;
    this.players = (
      owner
        ? [...players, owner]
        : players
    );

    if (!abstract)
      this.map = new RoadMap(this.players);

    this.onDestroy = onDestroy;
  }

  /**
   * Returns info about map
   */
  getBroadcastSocketJSON() {
    const {owner, map, players} = this;

    return {
      owner: owner.info.id,
      map: map.getBroadcastSocketJSON(),
      players: R.map(
        ({info}) => info.getBroadcastSocketJSON(),
        players,
      ),
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
    this.map?.appendPlayerCar(player);
  }

  /**
   * Remove player from list
   *
   * @param {Player} player
   */
  leave(player) {
    this.players = removeByID(player.id, this.players);
    this.map?.removePlayerCar(player);

    if (!this.playersCount)
      this.onDestroy?.(this);
  }
}
