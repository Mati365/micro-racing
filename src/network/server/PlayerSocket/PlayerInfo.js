import uniqid from 'uniqid';
import generateName from '@pkg/name-generator';

export default class PlayerInfo {
  constructor(
    {
      nick = generateName(),
      id = uniqid(),
      room = null,
    } = {},
  ) {
    this.nick = nick;
    this.id = id;
    this.room = room;
    this.inputs = [];
    this.lastProcessedInput = -1;
  }

  getBroadcastSocketJSON() {
    return {
      id: this.id,
      nick: this.nick,
    };
  }
}
