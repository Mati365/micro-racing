export default class RoomConfig {
  constructor(
    {
      laps = 4,
      countdown = 0,
      playersLimit = 3,
      playerIdleTime = 6000,
      spawnBotsBeforeStart = true,
      aiTraining = true,
    } = {},
  ) {
    this.laps = laps;
    this.countdown = countdown;
    this.playersLimit = playersLimit;
    this.spawnBotsBeforeStart = spawnBotsBeforeStart;
    this.playerIdleTime = playerIdleTime;
    this.aiTraining = aiTraining;
  }

  toBSON() {
    return {
      laps: this.laps,
      aiTraining: this.aiTraining,
    };
  }
}
