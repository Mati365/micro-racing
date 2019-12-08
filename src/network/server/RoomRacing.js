import {intervalCountdown} from '@pkg/basic-helpers';

import {createAnimationFrameRenderer} from '@pkg/isometric-renderer/FGL/core/viewport/createDtRenderLoop';
import {isCollisionWithEdge} from '@pkg/physics-scene/src/engines/diagonal';

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
    this.startTime = null;
    this.map = new RoadMapObjectsManager(room.map);
    this.state = new RaceState(RACE_STATES.WAIT_FOR_SERVER);
  }

  get allowPlayerJoin() {
    const {type} = this.state;

    return (
      type === RACE_STATES.COUNT_TO_START
        || type === RACE_STATES.WAIT_FOR_SERVER
    );
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
    this.startTime = Date.now();
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
    const {
      room,
      startTime,
      map: {
        physics,
        segmentsInfo: {checkpoints},
      },
    } = this;

    const {players} = room;
    const now = Date.now();

    for (let i = players.length - 1; i >= 0; --i) {
      const player = players[i];
      const {info} = player;
      const {racingState} = info;
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

      // update racing state
      racingState.currentLapTime = now - startTime;

      // check checkpoints intersection
      const lapCheckpoint = racingState.currentCheckpoint % checkpoints.length;
      const checkpointEdge = checkpoints[lapCheckpoint];

      if (checkpointEdge && isCollisionWithEdge(carBody, checkpointEdge)) {
        racingState.currentCheckpoint++;
        if (lapCheckpoint + 1 >= checkpoints.length)
          racingState.lap++;
      }
    }

    // calculate player positions
    const sortPlayers = players.sort(
      (p1, p2) => p2.info.racingState.currentCheckpoint - p1.info.racingState.currentCheckpoint,
    );

    // reassign position
    for (let i = sortPlayers.length - 1; i >= 0; --i) {
      const {racingState} = sortPlayers[i].info;
      racingState.position = i + 1;
    }

    // update physics
    physics.update();
    this.broadcastBoardObjects();

    // broadcast information about time and other stuff from players
    if (!this._framePlayersStateCounter)
      this.broadcastPlayersRaceState();

    this._framePlayersStateCounter = ((this._framePlayersStateCounter || 0) + 1) % 20;
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
   * Low latency binary socket caller, tracks players meta info
   * that can be sent later than broadcastBoardObjects()
   */
  broadcastPlayersRaceState() {
    const {players} = this.room;
    const frame = PlayerMapElement.raceStateBinarySnapshotSerializer.createPackedArrayFrame(
      player => player.info.car,
      players,
    );

    this.room.sendBroadcastAction(
      null,
      PLAYER_ACTIONS.UPDATE_PLAYERS_RACE_STATE,
      null,
      frame,
    );
  }

  /**
   * Low latency binary socket caller, broadcasts cars
   * positions and low level physics values
   */
  broadcastBoardObjects() {
    const {players} = this.room;
    const frame = PlayerMapElement.binarySnapshotSerializer.createPackedArrayFrame(
      player => player.info.car,
      players,
    );

    this.room.sendBroadcastAction(
      null,
      PLAYER_ACTIONS.UPDATE_BOARD_OBJECTS,
      null,
      frame,
    );
  }
}
