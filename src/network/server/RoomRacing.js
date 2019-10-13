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
    this.renderLoop = createAnimationFrameRenderer(
      {
        allowLerpUpdate: false,

        update: ::this.updateMapState,
        raf: setImmediate,
      },
    );
  }

  stop() {
    this.renderLoop?.();
    delete this.renderLoop;
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
        let processedInputs = 0;
        let prevFrameId = inputs[0].frameId;

        for (; processedInputs < inputs.length; ++processedInputs) {
          const input = inputs[processedInputs];
          if (prevFrameId !== input.frameId)
            break;

          prevFrameId = input.frameId;
          info.lastProcessedInput = input.id;

          carKeyboardDriver(input.bitset, carBody);
        }

        // used for client side prediction checks
        if (processedInputs < inputs.length)
          info.inputs.splice(0, processedInputs);
        else
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
    const view = new DataView(buffer);

    view.setInt8(offset++, players.length);
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
