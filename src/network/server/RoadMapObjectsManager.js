import * as R from 'ramda';

import {
  CAR_TYPES,
  CAR_ALIGN,
} from '@game/network/constants/serverCodes';

import PhysicsScene from '@pkg/physics-scene';
import PlayerMapElement, {genCarSegmentTransform} from '../shared/map/PlayerMapElement';

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
        object.id = this.generateID();
        items.push(object);
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
    const {items} = this.physics;

    this.totalPlayers--;
    this.physics.items = R.reject(
      obj => obj.player?.id === player.id,
      items,
    );
  }

  getBroadcastSocketJSON() {
    return {
      objects: this.physics.items,
    };
  }
}
