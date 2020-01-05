import * as R from 'ramda';
import consola from 'consola';

import {CAR_ALIGN} from '@game/network/constants/serverCodes';

import forkPopulation from '@pkg/neural-network/src/genetic/forkPopulation';
import {createLowLatencyObservable} from '@pkg/basic-helpers';

const sortByScore = R.sortWith(
  [
    R.descend(R.prop('score')),
  ],
);

export default class CarNeuralTrainer {
  constructor(
    {
      map,
      room,
    },
  ) {
    this.map = map;
    this.room = room;
    this.observers = {
      bestNeuralItems: createLowLatencyObservable(null),
    };
  }

  /**
   * Iterates over all players, picks winners and mutate them
   *
   * @param {Player[]} players
   * @returns
   * @memberof CarNeuralTrainer
   */
  trainPopulation(players) {
    const {map, observers} = this;
    const bestNeuralItems = observers.bestNeuralItems.getLastValue();

    const neuralItems = R.compose(
      R.slice(0, players.length),
      sortByScore,
      list => [
        ...list,
        ...bestNeuralItems || [],
      ],
      R.map(
        R.pick(['score', 'neural']),
      ),
      R.reject(R.isNil),
      R.map(
        ({ai}) => ai?.updateScore(),
      ),
    )(players);

    // check if regression
    if (!bestNeuralItems || bestNeuralItems[0].score <= neuralItems[0].score) {
      consola.warn(`Population: good! ${neuralItems[0].score}!`);
      observers.bestNeuralItems.notify(neuralItems);
    }

    const forkedNeurals = forkPopulation(neuralItems);
    const align = CAR_ALIGN.CENTER;

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
          align,
        },
      );
      car.unfreeze();
    }

    return neuralItems;
  }
}
