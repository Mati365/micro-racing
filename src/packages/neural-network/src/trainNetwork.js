import * as R from 'ramda';
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

  for (let i = times - 1; i >= 0; --i) {
    const {
      input,
      output,
    } = trainData[
      Math.floor(Math.random() * trainData.length)
    ];

    T.unsafeForwardPropagate(input, trainedNetwork);
    T.unsafeBackwardPropagate(learningRate, output, trainedNetwork);
  }

  return trainedNetwork;
};

export default trainNetwork;
