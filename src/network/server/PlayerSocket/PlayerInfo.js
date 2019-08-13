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
  }
}
