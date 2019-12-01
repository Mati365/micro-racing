import {intervalCountdown} from '@pkg/basic-helpers';

import {createAnimationFrameRenderer} from '@pkg/isometric-renderer/FGL/core/viewport/createDtRenderLoop';
import carKeyboardDriver from '../shared/logic/drivers/carKeyboardDriver';

import {
  PLAYER_ACTIONS,
  RACE_STATES,
} from '../constants/serverCodes';

import {PlayerMapElement} from '../shared/map';
import RoadMapObjectsManager from './RoadMapObjectsManager';
import RaceState from '../shared/room/RoomRaceState';

export default class RoomRacing {
  constructor(
    {
      room,
    },
  ) {
    this.room = room;
    this.map = new RoadMapObjectsManager(room.map);
    this.state = new RaceState(RACE_STATES.WAIT_FOR_SERVER);
  }

  get config() {
    return this.room.config;
  }

  getRaceState() {
    return this.state;
  }

  setRaceState(state, broadcast = true) {
    this.state = state;
    if (broadcast)
      this.broadcastRoomState(state);

    return this;
  }

  async start() {
    const {config} = this;

    if (config.countdown) {
      await intervalCountdown(
        {
          times: config.countdown,
        },
      )(
        (countdown) => {
          this.setRaceState(
            new RaceState(
              RACE_STATES.COUNT_TO_START,
              {
                countdown,
              },
            ),
          );
        },
      );
    }

    this.setRaceState(
      new RaceState(RACE_STATES.RACE),
    );

    /**
     * setImmediate is more CPU intense and
     * difference between both are small
     */
    this.renderLoop = createAnimationFrameRenderer(
      {
        allowLerpUpdate: false,

        update: ::this.updateMapState,
        raf: fn => setTimeout(fn, 0),
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
    const {map: {physics}} = this;
    const {players} = this.room;

    for (let i = players.length - 1; i >= 0; --i) {
      const player = players[i];
      const {info} = player;
      const {body: carBody} = info.car;

      // process inputs from oldest to newest
      const {inputs} = info;
      let prevFrameId = null;
      let processedInputs = 0;

      info.lastProcessedInput = -1;
      if (inputs.length) {
        prevFrameId = inputs[processedInputs].frameId;

        for (;;++processedInputs) {
          const input = inputs[processedInputs];
          if (!input || prevFrameId !== input.frameId)
            break;

          prevFrameId = input.frameId;
          info.lastProcessedInput = input.id;

          carKeyboardDriver(input.bitset, carBody);
        }

        // used for client side prediction checks
        info.inputs.splice(0, processedInputs);
      }

      carBody.idleInputs = prevFrameId === null;
    }

    physics.update();
    this.broadcastBoardObjects();
  }

  /**
   * High latency, send race state (total laps and other stuff)
   */
  broadcastRoomState(state = this.state) {
    this.room.sendBroadcastAction(
      null,
      PLAYER_ACTIONS.UPDATE_RACE_STATE,
      null,
      state,
    );
  }

  /**
   * Low latency binary socket caller, broadcasts cars
   * positions and low level physics values
   */
  broadcastBoardObjects() {
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
      PLAYER_ACTIONS.UPDATE_BOARD_OBJECTS,
      null,
      new Uint8Array(buffer),
    );
  }
}
