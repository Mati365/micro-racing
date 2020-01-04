import * as R from 'ramda';
import consola from 'consola';

import {
  getRandomFloatNumber,
  getRandomArrayItem,
  getRandomIntInclusive,
} from '@pkg/basic-helpers/base/random';

import * as T from '..';

const pickFitness = R.prop('score');

const pluckNeurals = R.pluck('neural');

export const getWinnersByFitness = count => R.compose(
  R.reverse,
  R.takeLast(count),
  R.sortBy(pickFitness),
);

// 0.5, without gene it worked
const mutateValues = (mutateRate, mutateMaxValue = 0.4) => R.map(
  (gene) => {
    if (Math.random() > mutateRate) {
      return (
        getRandomFloatNumber(-mutateMaxValue, mutateMaxValue)
          + gene * (1 + getRandomFloatNumber(-0.1, 0.15))
      );
    }

    return gene;
  },
);

const crossoverValues = (geneA, geneB, slicePoint = null) => {
  if (slicePoint === null)
    slicePoint = getRandomIntInclusive(0, geneA.length - 1);

  return [
    ...geneA.slice(0, slicePoint),
    ...geneB.slice(slicePoint, geneB.length),
  ];
};

export const crossoverGenes = (neuralA, neuralB) => {
  const [_a, _b] = (
    Math.random() > 0.25
      ? [neuralA, neuralB]
      : [neuralB, neuralA]
  );

  return {
    weights: crossoverValues(_a.weights, _b.weights),
    biases: crossoverValues(_a.biases, _b.biases),
  };
};

const mutate1DNeural = mutateRate => R.mapObjIndexed(
  mutateValues(mutateRate),
);

/**
 * Creates mutation chain for neural network.
 * neuralSchema is used only for restore 1D neural network
 *
 * @param {Number}          mutateRate
 * @param {NeuralNetwork[]} winnersNeurals
 */
const createNeuralMutator = (mutateRate, winnersNeurals) => {
  const winners1D = R.map(T.dumpTo1D, winnersNeurals);

  return (itemIndex, total) => {
    let new1D = null;

    // first is made from the best items
    if (!itemIndex)
      [new1D] = winners1D;

    if (itemIndex < total / 2)
      new1D = mutate1DNeural(mutateRate)(winners1D[0]);
    else if (itemIndex <= total * 3 / 4)
      new1D = crossoverGenes(winners1D[0], winners1D[1]);
    else if (itemIndex < total - 3) {
      new1D = crossoverGenes(
        getRandomArrayItem(winners1D),
        getRandomArrayItem(winners1D),
      );
    } else
      new1D = mutate1DNeural(mutateRate)(getRandomArrayItem(winners1D));

    return T.restoreFrom1D(winnersNeurals[0])(new1D);
  };
};

/**
 * @param {NeuralItem[]}  neuralItems
 *
 * @see
 * https://4programmers.net/Z_pogranicza/Sztuczne_sieci_neuronowe_i_algorytmy_genetyczne
 * https://pl.wikipedia.org/wiki/Algorytm_genetyczny
 *
 * https://stackoverflow.com/a/14020358
 * https://www.tutorialspoint.com/genetic_algorithms/genetic_algorithms_parent_selection.htm
 *
 * Algorithm:
 * http://www.cleveralgorithms.com/nature-inspired/evolution/genetic_algorithm.html
 */
const forkPopulation = (neuralItems) => {
  const winners = getWinnersByFitness(4)(neuralItems);
  const mutateNeural = createNeuralMutator(0.9, pluckNeurals(winners)); // it is just schema

  // check if all are losers
  const abortion = !R.any(
    R.propSatisfies(R.lt(0), 'score'),
    winners,
  );

  if (abortion) {
    consola.warn('Population: abortion!');
    return null;
  }

  return {
    prevWinnerScore: winners[0].score,
    neuralItems,
    list: R.compose(
      R.addIndex(R.map)(
        (item, index) => mutateNeural(index, neuralItems.length, item),
      ),
      pluckNeurals,
    )(neuralItems),
  };
};

export default forkPopulation;
