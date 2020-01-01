import {getNeuronActivationFn} from '../neuron';
import {getNeuronsWeightsSum} from './forwardPropagate';

/**
 * Correct neurons flags
 *
 * @todo
 *  Optimize, performance here sucks, it shoule be merged into
 *  backwardProapgate. Maybe wrong algorithm?
 *
 * @param {Number}  learningRate
 * @param {Network} network
 */
const updateWeights = (learningRate, network) => {
  const {layers} = network;
  if (layers.length <= 2)
    return network;

  // iterate over all layers
  for (let i = 0; i < layers.length - 1; ++i) {
    const {
      neuronsMatrix,
      weightsMatrix,
    } = layers[i];

    for (let j = weightsMatrix.length - 1; j >= 0; --j) {
      const inNeuronWeights = weightsMatrix[j];

      for (let neuronIndex = inNeuronWeights.length - 1; neuronIndex >= 0; --neuronIndex) {
        inNeuronWeights[neuronIndex] += (
          learningRate
             * neuronsMatrix[j].value
             * layers[i + 1].neuronsMatrix[neuronIndex].errorDelta
        );
      }
    }
  }

  return network;
};

/**
 * Do not use FP and ramda here! only plain js!
 *
 * @param {Number}    learningRate
 * @param {Number[]}  preferredOutput
 * @param {Network}   network
 *
 * @returns {Network}
 */
const backwardPropagate = (learningRate, preferredOutput, network) => {
  const {layers} = network;
  const hiddenLayerLastIndex = layers.length - 2;

  // nothing to check if network has only one layer
  if (hiddenLayerLastIndex <= 0)
    return network;

  const {
    neuronsMatrix: outputNeurons,
  } = layers[layers.length - 1];

  // perform checks on output layer, it is soo special
  for (let i = outputNeurons.length - 1; i >= 0; --i) {
    const neuron = outputNeurons[i];

    // Delta output sum = S'(sum) * (output sum margin of error)
    const delta = preferredOutput[i] - neuron.value;
    const sum = getNeuronsWeightsSum(
      neuron,
      layers[hiddenLayerLastIndex],
      i,
    );

    neuron.errorDelta = (
      getNeuronActivationFn(neuron).derivative(sum) * delta
    );
  }

  // check all layers, omit output and input because they are special
  for (let i = hiddenLayerLastIndex; i >= 1; --i) {
    const prevLayer = layers[i - 1];
    const {
      neuronsMatrix: nextLayerNeurons,
    } = layers[i + 1];

    const {
      neuronsMatrix: hiddenNeurons,
      weightsMatrix,
    } = layers[i];

    // iterate all neurons in each layer
    for (let neuronIndex = hiddenNeurons.length - 1; neuronIndex >= 0; --neuronIndex) {
      const neuron = hiddenNeurons[neuronIndex];
      const inputSum = getNeuronsWeightsSum(neuron, prevLayer, neuronIndex);

      // iterate over all neuron outputs to next layer
      // and sum their erorrDleta and weight
      let outputDeltaSum = 0;
      for (let nNeuronIndex = nextLayerNeurons.length - 1; nNeuronIndex >= 0; --nNeuronIndex) {
        outputDeltaSum += (
          nextLayerNeurons[nNeuronIndex].errorDelta * weightsMatrix[neuronIndex][nNeuronIndex]
        );
      }

      // delta(x) = (neuron.delta(x + 1) * weight(x, x + 1)) + ...) * derivative(sum)
      neuron.errorDelta = (
        outputDeltaSum * getNeuronActivationFn(neuron).derivative(inputSum)
      );
    }
  }

  return updateWeights(learningRate, network);
};

export default backwardPropagate;
