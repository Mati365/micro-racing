import * as R from 'ramda';

import PALETTE from '@pkg/isometric-renderer/FGL/core/constants/colors';
import {
  OBJECT_TYPES,
  CAR_TYPES,
} from '@game/network/constants/serverCodes';

import TrackPath from '@game/logic/track/TrackPath/TrackPath';
import TrackSegments from '../shared/logic/track/TrackSegments/TrackSegments';

import {MapElement} from '../shared/map';
import PlayerMapElement, {genCarSegmentTransform, CAR_ALIGN} from '../shared/map/PlayerMapElement';

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
    {
      objects,
      segmentsInfo,
    } = generateBlankObjects(),
  ) {
    this.segmentsInfo = segmentsInfo;
    this.appendObjects(objects);
  }

  generateID = (() => {
    let counter = 0;

    return () => (
      counter = (++counter) % 0xFFFF
    );
  })();

  appendObjects(objects) {
    if (!this.objects)
      this.objects = [];

    R.forEach(
      (object) => {
        object.id = this.generateID();
        this.objects.push(object);
      },
      objects,
    );
  }

  appendPlayerCar(
    player,
    {
      alignFn = genCarSegmentTransform,
      carType,
    } = {},
  ) {
    const {segments} = this.segmentsInfo;
    const playerElement = new PlayerMapElement(
      {
        player,
        carType: R.when(
          R.isNil,
          () => {
            const carTypesList = R.keys(CAR_TYPES);

            return CAR_TYPES[carTypesList[this.totalPlayers % carTypesList.length]];
          },
          carType,
        ),
        body: alignFn(
          {
            segment: segments[this.totalPlayers],
            align: CAR_ALIGN[this.totalPlayers % 2 ? 'LEFT_CORNER' : 'RIGHT_CORNER'],
          },
        ),
      },
    );

    this.totalPlayers++;
    this.appendObjects(
      [
        playerElement,
      ],
    );

    return playerElement;
  }

  removePlayerCar(player) {
    this.totalPlayers--;
    this.objects = R.reject(
      obj => obj.player?.id === player.id,
      this.objects,
    );
  }

  getBroadcastSocketJSON() {
    return {
      objects: this.objects,
    };
  }
}
