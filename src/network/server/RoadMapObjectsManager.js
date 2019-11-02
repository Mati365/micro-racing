import * as R from 'ramda';

import {CAR_TYPES} from '@game/network/constants/serverCodes';
import PlayerMapElement, {genCarSegmentTransform, CAR_ALIGN} from '../shared/map/PlayerMapElement';

/**
 * Manage map, align players on road etc
 */
export default class RoadMapObjectsManager {
  objects = [];

  totalPlayers = 0;

  constructor(map) {
    this.segmentsInfo = map.roadElement.getSegmentsInfo();
    this.appendObjects(map.objects);
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
