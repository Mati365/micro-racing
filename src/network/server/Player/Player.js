import PlayerInfo from './PlayerInfo';

export default class Player {
  constructor({
    info = new PlayerInfo,
  }) {
    this.info = info;
  }

  getBroadcastSocketJSON() {
    return this.info.getBroadcastSocketJSON();
  }

  get id() {
    return this.info.id;
  }

  get body() {
    return this.info.body;
  }
}
