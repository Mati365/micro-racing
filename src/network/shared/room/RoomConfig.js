export default class RoomConfig {
  constructor(
    {
      laps = 4,
      countdown = 10,
      playersLimit = 5,
      spawnBotsBeforeStart = true,
    } = {},
  ) {
    this.laps = laps;
    this.countdown = countdown;
    this.playersLimit = playersLimit;
    this.spawnBotsBeforeStart = spawnBotsBeforeStart;
  }

  toBSON() {
    return {
      laps: this.laps,
    };
  }
}
