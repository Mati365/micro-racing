import uniqid from 'uniqid';

import {PLAYER_TYPES} from '@game/network/constants/serverCodes';

import generateName from '@pkg/name-generator';

export default class PlayerInfo {
  constructor(
    {
      nick = generateName(),
      id = uniqid(),
      kind = PLAYER_TYPES.HUMAN,
      room = null,
    } = {},
  ) {
    this.nick = nick;
    this.id = id;
    this.kind = kind;
    this.room = room;
    this.inputs = [];
    this.lastProcessedInput = -1;
  }

  getBroadcastSocketJSON() {
    return {
      id: this.id,
      kind: this.kind,
      nick: this.nick,
    };
  }
}
