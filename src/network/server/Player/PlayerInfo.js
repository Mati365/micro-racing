import uniqid from 'uniqid';

import {
  PLAYER_RACE_STATES,
  PLAYER_TYPES,
} from '@game/network/constants/serverCodes';

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
  }

  reset() {
    Object.assign(
      this,
      {
        lastCheckpointTime: null,
        currentCheckpoint: 0,
        currentLapTime: 0,
        lap: 0,
        time: 0,
        lapsTimes: [],
      },
    );
  }

  isFreezed() {
    return hasFlag(PLAYER_RACE_STATES.FREEZE, this.state);
  }

  freeze() {
    this.state |= PLAYER_RACE_STATES.FREEZE;
    return this;
  }

  unfreeze() {
    this.state = removeFlag(PLAYER_RACE_STATES.FREEZE, this.state);
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
    this.lastIdleTime = null;
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
      racingState: this.racingState?.toBSON(),
    };
  }
}
