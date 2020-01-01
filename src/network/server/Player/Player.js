import PlayerInfo from './PlayerInfo';

export default class Player {
  constructor(
    {
      info = new PlayerInfo,
      room,
      server,
    },
  ) {
    this.server = server || room?.server;
    this.room = room;
    this.info = info;
  }

  reset() {
    this.info.reset();
    return this;
  }

  setCar(car) {
    this.info.car = car;
    return this;
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
