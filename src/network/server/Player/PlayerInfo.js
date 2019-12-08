import uniqid from 'uniqid';

import {PLAYER_TYPES} from '@game/network/constants/serverCodes';
import generateName from '@pkg/name-generator';

export class PlayerRacingState {
  constructor(
    {
      position = null,
      currentLapTime = 0,
      currentCheckpoint = 0,
      lap = 0,
      color,
    },
  ) {
    this.color = color;
    this.position = position;
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
