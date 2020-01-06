import * as R from 'ramda';
import {clamp} from '@pkg/gl-math';

export default class RoomConfig {
  constructor(
    {
      laps = 3,
      playersLimit = 4,
      aiTraining = false,
      countdown = 6000,
      playerIdleTime = 3500,
      recordHumanRace = false,
    } = {},
  ) {
    this.laps = laps;
    this.countdown = countdown;
    this.playersLimit = playersLimit;
    this.playerIdleTime = playerIdleTime;
    this.aiTraining = aiTraining;
    this.recordHumanRace = recordHumanRace;
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
      aiTraining: this.aiTraining,
      playersLimit: this.playersLimit,
    };
  }
}
