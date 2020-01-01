import * as R from 'ramda';

import {getRandomArrayItem} from '@pkg/basic-helpers/base/random';
import * as T from './unsafe';

/**
 * Train neural network using trainData
 *
 * @see
 *  Its is safe method, network provided via arg
 *  is copied and not modified. No side effects!
 *
 *  It is not used at all
 *
 * @param {Object[][]}  trainData
 * @param {Number}      learningRate
 * @param {Number}      times
 * @param {Network}     network
 *
 * @returns {Network}
 */
const trainNetwork = (trainData, learningRate, times, network) => {
  const trainedNetwork = R.clone(network);

  for (let i = R.defaultTo(trainData.length, times) - 1; i >= 0; --i) {
    const {
      inputs,
      outputs,
    } = (
      times === null
        ? trainData[i]
        : getRandomArrayItem(trainData)
    );

    T.unsafeForwardPropagate(inputs, trainedNetwork);
    T.unsafeBackwardPropagate(learningRate, outputs, trainedNetwork);
  }

  return trainedNetwork;
};

export default trainNetwork;
