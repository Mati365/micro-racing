import * as R from 'ramda';

import PALETTE from '@pkg/isometric-renderer/FGL/core/constants/colors';
import {
  OBJECT_TYPES,
  ERROR_CODES,
  CAR_TYPES,
} from '@game/network/constants/serverCodes';

import {
  findByID,
  removeByID,
} from '@pkg/basic-helpers';

import TrackPath from '@game/logic/track/TrackPath/TrackPath';
import ServerError from '../shared/ServerError';
import TrackSegments from '../shared/logic/track/TrackSegments/TrackSegments';
import MapElement from '../shared/MapElement';

const generateBlankMap = (players) => {
  const segmentsInfo = new TrackSegments(
    {
      segmentWidth: 2.5,
      transform: {
        scale: [0.1, 0.1, 1.0],
        translate: [0.0, 0.0, -0.01],
      },
      interpolatedPath: TrackPath.fromRandomPath().getInterpolatedPathPoints(),
    },
  );

  const {segments} = segmentsInfo;

  return {
    objects: [
      new MapElement(
        OBJECT_TYPES.PLAYER,
        {
          playerID: players[0].info.id,
          carType: CAR_TYPES.BLUE,
          transform: {
            rotate: [0, 0, segments[0].angle],
            scale: [1.25, 1.25, 1.25],
            translate: segments[0].point,
          },
        },
      ),

      new MapElement(
        OBJECT_TYPES.ROAD,
        {
          uniforms: {
            color: PALETTE.WHITE,
          },
          segmentsInfo,
        },
      ),

      new MapElement(
        OBJECT_TYPES.PRIMITIVE,
        {
          name: 'pyramid',
          uniforms: {
            color: PALETTE.YELLOW,
          },
          transform: {
            scale: [1.0, 1.0, 1.5],
            translate: [0, 0, -0.01],
          },
        },
      ),

      new MapElement(
        OBJECT_TYPES.PRIMITIVE,
        {
          name: 'box',
          uniforms: {
            color: PALETTE.GREEN,
          },
          transform: {
            scale: [1.0, 1.0, 1.5],
            translate: [6, 6, -0.01],
          },
        },
      ),

      new MapElement(
        OBJECT_TYPES.PRIMITIVE,
        {
          name: 'plainTerrainWireframe',
          constructor: {
            w: 64,
            h: 64,
          },
          uniforms: {
            color: PALETTE.DARK_GRAY,
          },
          transform: {
            scale: [64.0, 64.0, 1.0],
          },
        },
      ),
    ],
  };
};

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
      this.map = generateBlankMap(this.players);

    this.onDestroy = onDestroy;
  }

  /**
   * Returns info about map
   */
  getBroadcastSocketJSON() {
    const {owner, map, players} = this;

    return {
      owner: owner.info.id,
      map,
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
