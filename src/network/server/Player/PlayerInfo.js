import uniqid from 'uniqid';

import {PLAYER_TYPES} from '@game/network/constants/serverCodes';
import generateName from '@pkg/name-generator';

export class PlayerRacingState {
  constructor(
    {
      color,
    },
  ) {
    this.color = color;
  }

  getBroadcastSocketJSON() {
    return {
      color: this.color,
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

  getBroadcastSocketJSON() {
    return {
      id: this.id,
      kind: this.kind,
      nick: this.nick,
      racingState: this.racingState?.getBroadcastSocketJSON(),
    };
  }
}
