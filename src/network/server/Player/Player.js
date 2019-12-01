import PlayerInfo from './PlayerInfo';

export default class Player {
  constructor(
    {
      info = new PlayerInfo,
    },
  ) {
    this.info = info;
  }

  toBSON() {
    return this.info.toBSON();
  }

  get id() {
    return this.info.id;
  }

  get body() {
    return this.info.body;
  }
}
