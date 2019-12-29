import * as R from 'ramda';
import {clamp} from '@pkg/gl-math';

export default class RoomConfig {
  constructor(
    {
      laps = 1,
      playersLimit = 1,
      countdown = 6000,
      playerIdleTime = 2500,
      spawnBots = true,
      aiTraining = false,
    } = {},
  ) {
    this.laps = laps;
    this.countdown = countdown;
    this.playersLimit = playersLimit;
    this.spawnBots = spawnBots;
    this.playerIdleTime = playerIdleTime;
    this.aiTraining = aiTraining;
  }

  safeAssignConfig(config) {
    Object.assign(
      this,
      {
        laps: R.defaultTo(this.laps, clamp(1, 8, config.laps)),
        countdown: R.defaultTo(this.laps, clamp(0, 30000, config.countdown)),
        playerIdleTime: R.defaultTo(this.playerIdleTime, clamp(3000, 15000, config.playerIdleTime)),
        playersLimit: R.defaultTo(this.playersLimit, clamp(1, 6, config.playersLimit)),
      },
    );
  }

  static fromBSON(config) {
    return new RoomConfig(config);
  }

  toBSON() {
    return {
      laps: this.laps,
      countdown: this.countdown,
      playerIdleTime: this.playerIdleTime,
      spawnBots: this.spawnBots,
      aiTraining: this.aiTraining,
      playersLimit: this.playersLimit,
    };
  }
}
