export default class RoomConfig {
  constructor(
    {
      playersLimit = 5,
      maxLaps = 3,
      spawnBotsBeforeStart = true,
    } = {},
  ) {
    this.playersLimit = playersLimit;
    this.maxLaps = maxLaps;
    this.spawnBotsBeforeStart = spawnBotsBeforeStart;
  }
}
