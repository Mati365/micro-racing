import uniqid from 'uniqid';
import generateName from '@pkg/name-generator';

export default class PlayerInfo {
  constructor(
    {
      nick = generateName(),
      id = uniqid(),
    } = {},
  ) {
    this.nick = nick;
    this.id = id;
  }
}
