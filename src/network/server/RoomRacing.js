import chalk from 'chalk';
import consola from 'consola';
import * as R from 'ramda';

import {intervalCountdown} from '@pkg/basic-helpers';
import {wrapAroundMod} from '@pkg/gl-math';

import {createAnimationFrameRenderer} from '@pkg/isometric-renderer/FGL/core/viewport/createDtRenderLoop';
import {isDiagonalCollisionWithEdge} from '@pkg/physics-scene/src/engines/diagonal';
import {aabb} from '@pkg/physics-scene/src/engines';

import carKeyboardDriver from '../shared/logic/drivers/carKeyboardDriver';

import {
  CAR_ALIGN,
  PLAYER_ACTIONS,
  PLAYER_RACE_STATES,
  PLAYER_TYPES,
  RACE_STATES,
} from '../constants/serverCodes';

import {PlayerMapElement} from '../shared/map';
import {
  CarNeuralTrainer,
  CarTrackRecorder,
} from '../shared/logic/drivers/neural';

import RoadMapObjectsManager from './RoadMapObjectsManager';
import RaceState from '../shared/room/RoomRaceState';

export default class RoomRacing {
  constructor(
    {
      room,
      aiTrainer,
    },
  ) {
    this.room = room;
    this.startTime = null;

    this.map = new RoadMapObjectsManager(room.map);
    this.state = new RaceState(RACE_STATES.BOARD_VIEW);

    this.aiTrainer = room.config.aiTraining && (aiTrainer || new CarNeuralTrainer(
      {
        map: this.map,
        room: this.room,
      },
    ));

    this.recorder = room.config.recordHumanRace && new CarTrackRecorder;
  }

  get allowPlayerJoin() {
    const {type} = this.state;

    return (
      type === RACE_STATES.COUNT_TO_START
        || type === RACE_STATES.WAIT_FOR_SERVER
        || type === RACE_STATES.BOARD_VIEW
        || type === RACE_STATES.ALL_FINISH
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
      this.room.broadcastRoomInfo();

    return this;
  }

  async start() {
    const {recorder, config} = this;

    if (recorder)
      recorder.clear();

    this.setRaceState(
      new RaceState(RACE_STATES.PREPARE_TO_RACE),
    );

    if (config.countdown) {
      const result = await intervalCountdown(
        {
          times: config.countdown / 1000,
        },
      )(
        ({countdown, stopInterval}) => {
          if (this.state?.type === RACE_STATES.BOARD_VIEW) // see stop()
            stopInterval(false);
          else {
            this.setRaceState(
              new RaceState(
                RACE_STATES.COUNT_TO_START,
                {
                  countdown,
                },
              ),
            );
          }
        },
      );

      // room destroyed
      if (result === false)
        return;
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

  stop(state = new RaceState(RACE_STATES.BOARD_VIEW)) {
    if (state)
      this.setRaceState(state);

    this.renderLoop?.();
    delete this.renderLoop;
  }

  /**
   * Update whole map state
   */
  updateMapState() {
    const {
      aiTrainer,
      room,
      map: {
        physics,
      },
    } = this;

    const {players} = room;
    const aiWorldParams = {
      checkOnlyWithStatic: !!aiTrainer,
      physics,
      players,
    };

    let allAiFreezed = true;
    const now = Date.now();

    for (let i = players.length - 1; i >= 0; --i) {
      const player = players[i];
      const {info, ai} = player;
      const {body: carBody} = info.car;
      const {racingState} = info;

      const finish = racingState.isFinish();

      carBody.transparentToOthers = finish;
      if (finish)
        continue;

      if (info.inputs.length > 15)
        info.inputs = info.inputs.slice(0, 2);

      if (info.racingState.isFreezed())
        continue;

      if (info.kind === PLAYER_TYPES.HUMAN) {
        /**
         * HUMAN
         */
        const {inputs} = info;

        let prevFrameId = null;
        let processedInputs = 0;
        let idle = true;

        info.lastProcessedInput = -1;
        if (inputs.length) {
          prevFrameId = inputs[processedInputs].frameId;

          for (;;++processedInputs) {
            const input = inputs[processedInputs];
            if (!input || prevFrameId !== input.frameId)
              break;

            prevFrameId = input.frameId;
            info.lastProcessedInput = input.id;

            if (input.bitset)
              idle = false;

            carKeyboardDriver(input.bitset, carBody);
          }

          // used for client side prediction checks
          info.inputs.splice(0, processedInputs);
        }

        if (!idle)
          info.lastNonIdleTime = now;
      } else {
        /**
         * AI
         */
        allAiFreezed = false;
        ai.drive(aiWorldParams);
      }

      this.updatePlayerLaps(now, player);
      this.updateIdlePlayers(now, player);
    }

    // AI training
    if (aiTrainer && allAiFreezed) {
      aiTrainer.trainPopulation(players);
      this.startTime = now;
    }

    // update physics
    this.updatePhysics();
    this.broadcastBoardObjects();

    // broadcast information about time and other stuff from players
    if (!this._framePlayersStateCounter) {
      // calculate player positions
      const sortPlayers = players.sort(
        (p1, p2) => p2.info.racingState.currentCheckpoint - p1.info.racingState.currentCheckpoint,
      );

      // reassign position
      for (let i = sortPlayers.length - 1; i >= 0; --i) {
        const {racingState} = sortPlayers[i].info;
        racingState.position = i + 1;
      }

      this.broadcastPlayersRaceState();
    }

    this._framePlayersStateCounter = ((this._framePlayersStateCounter || 0) + 1) % 20;
  }

  /**
   * Perfomrs all bodies physics update
   *
   * @memberof RoomRacing
   */
  updatePhysics() {
    const {aiTrainer, map} = this;

    const {physics} = map;
    const {items} = physics;

    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      const {player} = item;
      const body = item.body || item;

      if (player && player.info.racingState.isFreezed())
        continue;

      body.update && body.update();

      const collision = physics.updateObjectPhysics(body, aiTrainer, true);
      if (player && player.ai && collision) {
        if (aiTrainer) {
          consola.info(`${chalk.green.bold('AiTrainer:')} Player ${chalk.bold.white(player.info.nick)} killed, it ${chalk.bold.red('collided')}!`);
          item.freeze();
        } else if (body.speed < 3 && !collision.moveable)
          this.flashResetCar(player);
      }
    }
  }

  /**
   * Count player laps using checkpoints
   *
   * @param {Date} time
   * @param {Player} player
   * @memberof RoomRacing
   */
  updatePlayerLaps(time, player) {
    const {
      recorder,
      aiTrainer,
      startTime,
      room: {
        config: roomConfig,
      },
      map: {
        physics,
        segmentsInfo: {checkpoints},
      },
    } = this;

    const {info} = player;
    const {car, racingState} = info;
    const {body: carBody} = car;

    // update racing state
    racingState.currentLapTime = time - startTime - racingState.time;

    // check checkpoints intersection
    const nextCheckpoint = wrapAroundMod(racingState.currentCheckpoint + 1, checkpoints.length);

    if (racingState.lastCheckpointTime === null
        && isDiagonalCollisionWithEdge(carBody, checkpoints[0])) {
      racingState.lastCheckpointTime = racingState.currentLapTime;
    } else if (isDiagonalCollisionWithEdge(carBody, checkpoints[nextCheckpoint])) {
      info.lastNonIdleTime = Date.now();

      racingState.currentCheckpoint++;
      racingState.lastCheckpointTime = racingState.currentLapTime;

      if (recorder && info.kind === PLAYER_TYPES.HUMAN) {
        recorder.record(
          {
            physics,
            body: carBody,
          },
        );

        if (!nextCheckpoint)
          recorder.flush();
      }

      if (!nextCheckpoint) {
        racingState.lapsTimes.push(racingState.currentLapTime);
        racingState.time += racingState.currentLapTime;
        racingState.currentLapTime = 0;

        // WIN!
        if (racingState.lap + 1 >= roomConfig.laps) {
          if (aiTrainer && player.ai) {
            consola.info(`${chalk.green.bold('AiTrainer:')} Player ${chalk.bold.white(player.info.nick)} killed, it ${chalk.bold.green('win')}!`);
            car.freeze();
          } else {
            info.racingState.state |= PLAYER_RACE_STATES.FINISH;

            Object.assign(
              carBody,
              {
                transparentToOthers: true,
                throttle: 0,
                steerAngle: 0,
                lockInputs: true,
              },
            );

            this.checkRaceFinish();
          }
        } else
          racingState.lap++;
      }
    }
  }

  /**
   * Check if all players are on finish
   *
   * @memberof RoomRacing
   */
  checkRaceFinish() {
    const {room} = this;
    const {players} = room;

    if (!R.all(player => player.info.racingState.isFinish(), players))
      return false;

    this.stop(
      new RaceState(RACE_STATES.ALL_FINISH),
    );

    return true;
  }

  /**
   * Perform punishment for idle players!
   *
   * @param {Date} time
   * @param {Player} player
   * @memberof RoomRacing
   */
  updateIdlePlayers(time, player) {
    const {aiTrainer} = this;
    const {playerIdleTime} = this.room.config;

    const {ai, info} = player;
    const {car, racingState} = info;

    // detect non progress players
    const nonProgressTime = racingState.currentLapTime - (racingState.lastCheckpointTime || 0);
    if (aiTrainer && nonProgressTime > playerIdleTime) {
      // punish bot
      if (ai) {
        consola.info(`${chalk.green.bold('AiTrainer:')} Player ${chalk.bold.white(info.nick)} killed, it was ${chalk.bold.bold('idle')}!`);
        car.freeze();
      }

      return true;
    }

    // transform to bots idle players
    if (time - (info.lastNonIdleTime || this.startTime) > playerIdleTime) {
      if (info.kind === PLAYER_TYPES.HUMAN)
        player.transformToZombie();
      else if (!aiTrainer)
        this.flashResetCar(player);

      return true;
    }

    return false;
  }

  /**
   * Moves car to center of road and make it flash
   *
   * @param {*} player
   * @memberof RoomRacing
   */
  flashResetCar(player) {
    const {map} = this;
    const {players} = this.room;
    const {info} = player;

    info.lastNonIdleTime = Date.now();
    info.racingState.flash();

    // check aabb collisions with other players
    for (let i = 0; i < 10; ++i) {
      map.resetPlayerPositionToSegment(
        {
          absolutePosition: true,
          position: info.racingState.currentCheckpoint - i - 1,
          playerElement: info.car,
          align: CAR_ALIGN.CENTER,
        },
      );

      let resetSegment = false;
      for (let j = 0; j < players.length; ++j) {
        if (players[j] !== player && aabb(players[j].info.car.body.box, info.car.body.box)) {
          resetSegment = true;
          break;
        }
      }

      if (!resetSegment)
        break;
    }
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
