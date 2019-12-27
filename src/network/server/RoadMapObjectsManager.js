import * as R from 'ramda';

import {CAR_ALIGN} from '@game/network/constants/serverCodes';

import PhysicsScene from '@pkg/physics-scene';
import PlayerMapElement, {genCarSegmentTransform} from '../shared/map/PlayerMapElement';

import {
  MAP_BINARY_ELEMENTS_DESERIALIZERS,
  MapElement,
} from '../shared/map';

/**
 * Manage map, align players on road etc
 */
export default class RoadMapObjectsManager {
  objects = [];

  totalPlayers = 0;

  constructor(map) {
    this.segmentsInfo = map.roadElement.getSegmentsInfo();
    this.physics = new PhysicsScene;

    this.appendObjects(map.objects);
  }

  generateID = (() => {
    let counter = 0;

    return () => (
      counter = (++counter) % 0xFFFF
    );
  })();

  appendObjects(objects) {
    const {items} = this.physics;

    R.forEach(
      (object) => {
        // map loaded directly from binary
        if (!(object instanceof MapElement))
          object = MAP_BINARY_ELEMENTS_DESERIALIZERS[object.type]?.(object) || object;

        object.id = this.generateID();
        items.push(object);
      },
      objects,
    );
  }

  removePlayerCar(player) {
    const {items} = this.physics;

    this.totalPlayers--;
    this.physics.items = R.reject(
      obj => obj.player?.id === player.id,
      items,
    );
  }

  appendPlayerCar(
    player,
    {
      alignFn = genCarSegmentTransform,
      position,
      carType,
    } = {},
  ) {
    const playerElement = new PlayerMapElement(
      {
        player,
        carType: R.defaultTo(
          player.info.carType,
          carType,
        ),
        body: {},
      },
    );

    this.resetPlayerPositionToSegment(
      {
        position: R.defaultTo(this.totalPlayers, position),
        playerElement,
        alignFn,
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

  /**
   * Used in AI training methods
   *
   * @param {*} {
   *       alignFn = genCarSegmentTransform,
   *       position,
   *       playerElement,
   *     }
   * @returns
   * @memberof RoadMapObjectsManager
   */
  resetPlayerPositionToSegment(
    {
      playerElement,
      position = 0,
      absolutePosition = false,
      align = CAR_ALIGN[position % 2 ? 'LEFT_CORNER' : 'RIGHT_CORNER'],
      alignFn = genCarSegmentTransform,
    },
  ) {
    const {segments} = this.segmentsInfo;
    const bodyParams = alignFn(
      {
        segment: segments[(
          absolutePosition
            ? position
            : (segments.length - position - 1)
        ) % segments.length],
        align,
      },
    );

    Object.assign(playerElement.body, bodyParams);
    return playerElement;
  }

  toBSON() {
    return {
      objects: this.physics.items,
    };
  }
}
