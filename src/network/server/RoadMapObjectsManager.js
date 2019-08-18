import * as R from 'ramda';

import PALETTE from '@pkg/isometric-renderer/FGL/core/constants/colors';
import {
  OBJECT_TYPES,
  CAR_TYPES,
} from '@game/network/constants/serverCodes';

import TrackPath from '@game/logic/track/TrackPath/TrackPath';
import TrackSegments from '../shared/logic/track/TrackSegments/TrackSegments';
import MapElement from '../shared/MapElement';

import genCarSegmentTransform, {CAR_ALIGN} from '../shared/logic/genCarSegmentTransform';

const generateBlankObjects = () => {
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

  return {
    segmentsInfo,
    objects: [
      new MapElement(
        OBJECT_TYPES.TERRAIN,
        {
          transform: {
            scale: [64.0, 64.0, 1.0],
          },
          size: {
            w: 64,
            h: 64,
          },
          items: R.times(
            () => ({
              uv: [1, 0],
            }),
            64 * 64,
          ),
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

      new MapElement(
        OBJECT_TYPES.ROAD,
        {
          uniforms: {
            color: PALETTE.WHITE,
          },
          segmentsInfo,
        },
      ),
    ],
  };
};

/**
 * Manage map, align players on road etc
 */
export default class RoadMapObjectsManager {
  objects = [];

  totalPlayers = 0;

  constructor(
    players,
    {
      objects,
      segmentsInfo,
    } = generateBlankObjects(),
  ) {
    this.objects = objects;
    this.segmentsInfo = segmentsInfo;

    R.forEach(::this.appendPlayerCar, players || []);
  }

  appendPlayerCar(
    player,
    {
      alignFn = genCarSegmentTransform,
      carType = CAR_TYPES.BLUE,
    } = {},
  ) {
    const {segments} = this.segmentsInfo;

    const playerElement = new MapElement(
      OBJECT_TYPES.PLAYER,
      {
        playerID: player.id,
        carType,
        transform: {
          ...alignFn(
            {
              segment: segments[this.totalPlayers],
              align: CAR_ALIGN[this.totalPlayers % 2 ? 'LEFT_CORNER' : 'RIGHT_CORNER'],
            },
          ),
          scale: [1.25, 1.25, 1.25],
        },
      },
    );

    this.totalPlayers++;
    this.objects.push(playerElement);

    return playerElement;
  }

  removePlayerCar(player) {
    this.totalPlayers--;
    this.objects = R.reject(
      ({params: {playerID}}) => playerID === player.id,
      this.objects,
    );
  }

  getBroadcastSocketJSON() {
    return {
      objects: this.objects,
    };
  }
}
