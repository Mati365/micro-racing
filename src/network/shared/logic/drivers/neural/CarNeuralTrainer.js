import * as R from 'ramda';
import consola from 'consola';

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

  trainPopulation(players) {
    const {bestNeuralItems, map} = this;
    let neuralItems = R.compose(
      R.sortWith(
        [
          R.descend(R.prop('score')),
        ],
      ),
      R.map(
        R.pick(['score', 'neural']),
      ),
      R.reject(R.isNil),
      R.map(
        ({ai}) => ai?.updateScore(),
      ),
    )(players);

    // check if regression
    if (bestNeuralItems && bestNeuralItems[0].score > neuralItems[0].score) {
      consola.warn(`Population: Regression! Prev score: ${bestNeuralItems[0].score}!`);
      neuralItems = bestNeuralItems;
    } else
      this.bestNeuralItems = neuralItems;

    const forkedNeurals = forkPopulation(neuralItems);
    for (let i = 0, neuralIndex = 0; i < players.length; ++i) {
      const player = players[i];
      const {ai} = player;
      const {car, racingState} = player.info;

      if (ai) {
        const newNeural = forkedNeurals?.list[neuralIndex++];

        ai.setNeural(newNeural);
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
}
