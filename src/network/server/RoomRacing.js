import {createAnimationFrameRenderer} from '@pkg/isometric-renderer/FGL/core/viewport/createDtRenderLoop';
import carKeyboardDriver from '../shared/logic/drivers/carKeyboardDriver';

import RoadMapObjectsManager from './RoadMapObjectsManager';
import {PlayerMapElement} from '../shared/map';

import {PLAYER_ACTIONS} from '../constants/serverCodes';

export default class RoomRacing {
  constructor({room}) {
    this.room = room;
    this.map = new RoadMapObjectsManager;
  }

  start() {
    createAnimationFrameRenderer(
      {
        allowLerpUpdate: false,

        update: ::this.updateMapState,
        raf: fn => setTimeout(fn, 0),
      },
    );
  }

  /**
   * Update whole map state
   */
  updateMapState() {
    const {players} = this.room;

    for (let i = players.length - 1; i >= 0; --i) {
      const player = players[i];
      const {info} = player;
      const {body: carBody} = info.car;

      // process inputs from oldest to newest
      const {inputs} = info;
      if (inputs.length) {
        for (let j = 0; j < inputs.length; ++j)
          carKeyboardDriver(inputs[j].bitset, carBody);

        // used for client side prediction checks
        info.lastProcessedInput = inputs[inputs.length - 1];
        info.inputs = [];
      }

      carBody.update();
    }

    this.broadcastRaceState();
  }

  broadcastRaceState() {
    const {players} = this.room;
    const serializer = PlayerMapElement.binarySnapshotSerializer;

    let offset = 0;
    const buffer = new ArrayBuffer(1 + serializer.size * players.length);
    new DataView(buffer).setInt8(offset++, players.length);

    for (let i = players.length - 1; i >= 0; --i) {
      serializer.pack(players[i].info.car, buffer, offset);
      offset += serializer.size;
    }

    this.room.sendBroadcastAction(
      null,
      PLAYER_ACTIONS.UPDATE_RACE_STATE,
      null,
      new Uint8Array(buffer),
    );
  }
}
