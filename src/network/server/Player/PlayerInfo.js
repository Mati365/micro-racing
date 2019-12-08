import uniqid from 'uniqid';

import {
  PLAYER_RACE_STATES,
  PLAYER_TYPES,
} from '@game/network/constants/serverCodes';

import generateName from '@pkg/name-generator';

export class PlayerRacingState {
  constructor(
    {
      state = PLAYER_RACE_STATES.RACE,
      position = null,
      time = 0,
      currentCheckpoint = 0,
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

    // do not leak info to client:
    this.currentCheckpoint = currentCheckpoint;
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
    this.racingState = racingState;
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
