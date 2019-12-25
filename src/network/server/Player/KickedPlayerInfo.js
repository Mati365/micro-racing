export default class KickedPlayerInfo {
  constructor(
    {
      lastIP,
      lastNick,
      id,
    },
  ) {
    this.lastIP = lastIP;
    this.lastNick = lastNick;
    this.id = id;
  }

  toListBSON() {
    const {lastNick, id} = this;

    return {
      nick: lastNick,
      id,
    };
  }

  isSimilarToPlayer(player) {
    return (
      player.id === this.id
        || this.lastIP === player.ip
    );
  }

  static fromPlayer(player) {
    const {ip, info} = player;

    return new KickedPlayerInfo(
      {
        lastIP: ip,
        lastNick: info.nick,
        id: info.id,
      },
    );
  }
}
