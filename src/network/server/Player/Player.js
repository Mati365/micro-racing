import PlayerInfo from './PlayerInfo';

export default class Player {
  constructor(
    {
      info = new PlayerInfo,
    },
  ) {
    this.info = info;
  }

  assignRoom({car, room, racingState}) {
    Object.assign(
      this.info,
      {
        car,
        room,
        racingState,
      },
    );
  }

  toBSON() {
    return this.info.toBSON();
  }

  get car() {
    return this.info.car;
  }

  get id() {
    return this.info.id;
  }

  get body() {
    return this.info.body;
  }
}
