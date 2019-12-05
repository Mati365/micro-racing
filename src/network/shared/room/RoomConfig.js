export default class RoomConfig {
  constructor(
    {
      laps = 4,
      countdown = 1,
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
