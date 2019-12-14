import * as R from 'ramda';
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
    const forkedNeurals = R.compose(
      forkPopulation,
      R.pluck('ai'),
    )(players);

    for (let i = 0; i < players.length; ++i) {
      const player = players[i];
      const {ai} = player;
      const {car, racingState} = player.info;

      if (ai) {
        ai.resetScore();
        ai.neural = forkedNeurals.pop();
        racingState.reset();
      }

      map.resetPlayerPositionToSegment(
        {
          playerElement: car,
          position: i,
        },
      );
      car.unfreeze();
    }
  }
  /* eslint-enable class-methods-use-this */
}
