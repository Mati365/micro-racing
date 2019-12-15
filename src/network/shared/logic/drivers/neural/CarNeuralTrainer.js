import * as R from 'ramda';

import {CAR_ALIGN} from '@game/network/constants/serverCodes';
import forkPopulation from '@pkg/neural-network/src/genetic/forkPopulation';

export default class CarNeuralTrainer {
  constructor(
    {
      map,
      room,
    },
  ) {
    this.map = map;
    this.room = room;
  }

  /* eslint-disable class-methods-use-this */
  trainPopulation(players) {
    const {map} = this;
    this.forkedNeurals = R.compose(
      forkPopulation(this.forkedNeurals),
      R.reject(R.isNil),
      R.map(
        ({ai}) => ai?.updateScore(),
      ),
    )(players);

    for (let i = 0; i < players.length; ++i) {
      const player = players[i];
      const {ai} = player;
      const {car, racingState} = player.info;

      if (ai) {
        ai.setNeural(
          this.forkedNeurals?.list.pop(),
        );
        racingState.reset();
      }

      map.resetPlayerPositionToSegment(
        {
          playerElement: car,
          align: CAR_ALIGN.CENTER,
        },
      );
      car.unfreeze();
    }
  }
  /* eslint-enable class-methods-use-this */
}
