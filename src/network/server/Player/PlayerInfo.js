import uniqid from 'uniqid';
import * as R from 'ramda';

import {
  CAR_TYPES,
  PLAYER_RACE_STATES,
  PLAYER_TYPES,
} from '@game/network/constants/serverCodes';

import {getRandomObjValue} from '@pkg/basic-helpers';
import {
  removeFlag,
  hasFlag,
} from '@pkg/basic-helpers/base/bits';

import generateName from '@pkg/name-generator';

export class PlayerRacingState {
  constructor(
    {
      state = PLAYER_RACE_STATES.RACE,
      position = null,
      time = 0,
      currentCheckpoint = 0,
      lastCheckpointTime = null,
      currentLapTime = 0,
      lap = 0,
      color,
    },
  ) {
    this.state = state;
    this.color = color;
    this.position = position;
    this.time = time;
    this.currentLapTime = currentLapTime;

    this.lap = lap;
    this.lapsTimes = [];

    // do not leak info to client:
    this.lastCheckpointTime = lastCheckpointTime;
    this.currentCheckpoint = currentCheckpoint;

    // for events such as flash
    this.timers = [];
  }

  release() {
    R.forEach(
      clearTimeout,
      this.timers,
    );
    this.timers = [];
  }

  reset() {
    this.release();

    Object.assign(
      this,
      {
        state: PLAYER_RACE_STATES.RACE,
        lastCheckpointTime: null,
        currentCheckpoint: 0,
        currentLapTime: 0,
        lap: 0,
        time: 0,
        lapsTimes: [],
      },
    );
  }

  isFreezed() { return hasFlag(PLAYER_RACE_STATES.FREEZE, this.state); }

  isFlashing() { return hasFlag(PLAYER_RACE_STATES.FLASH, this.state); }

  isFinish() { return hasFlag(PLAYER_RACE_STATES.FINISH, this.state); }

  freeze() {
    this.state |= PLAYER_RACE_STATES.FREEZE;
    return this;
  }

  unfreeze() {
    this.state = removeFlag(PLAYER_RACE_STATES.FREEZE, this.state);
    return this;
  }

  flash(duration = 3000) {
    if (hasFlag(PLAYER_RACE_STATES.FLASH, this.state))
      return this;

    this.state |= PLAYER_RACE_STATES.FLASH;
    this.timers.push(
      setTimeout(
        () => {
          this.state = removeFlag(PLAYER_RACE_STATES.FLASH, this.state);
        },
        duration,
      ),
    );

    return this;
  }

  /**
   * @see
   *  PlayerMapElement.raceStateBinarySnapshotSerializer
   */
  toBSON() {
    return {
      color: this.color,
      currentLapTime: this.currentLapTime,
      time: this.time,
      lapsTimes: this.lapsTimes,
      lap: this.lap,
      position: this.position,
      state: this.state,
    };
  }
}

export default class PlayerInfo {
  constructor(
    {
      nick = generateName(),
      id = uniqid(),
      kind = PLAYER_TYPES.HUMAN,
      racingState = null,
      room = null,
    } = {},
  ) {
    this.nick = nick;
    this.id = id;
    this.kind = kind;
    this.room = room;
    this.inputs = [];
    this.lastProcessedInput = -1;
    this.lastNonIdleTime = null;
    this.carType = getRandomObjValue(CAR_TYPES);
    this.racingState = racingState;
  }

  static fromBSON(json) {
    return new PlayerInfo(
      {
        ...json,
        racingState: new PlayerRacingState(json.racingState),
      },
    );
  }

  toBSON() {
    return {
      id: this.id,
      kind: this.kind,
      nick: this.nick,
      carType: this.carType,
      racingState: this.racingState?.toBSON(),
    };
  }

  reset() {
    this.inputs = [];
    this.lastProcessedInput = -1;
    this.lastNonIdleTime = null;
    this.racingState?.reset();
  }

  release() {
    const {racingState} = this;
    racingState?.release();
  }
}
