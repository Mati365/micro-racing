import {getNeuronActivationFn} from '../neuron';

/**
 * Sums all weights and neuron from previous layer
 *
 * @param {Neuron}  neuron
 * @param {Layer}   layer
 * @param {Number}  neuronIndex
 *
 * @returns {Number}
 */
export const getNeuronsWeightsSum = (neuron, layer, neuronIndex) => {
  const {
    neuronsMatrix: prevLayerNeurons,
    weightsMatrix: prevLayerWeights,
  } = layer;

  let sum = neuron.bias;
  for (let pNeuronIndex = prevLayerNeurons.length - 1; pNeuronIndex >= 0; --pNeuronIndex)
    sum += prevLayerNeurons[pNeuronIndex].value * prevLayerWeights[pNeuronIndex][neuronIndex];

  return sum;
};

/**
 * Do not use FP stuff here, it should be as fast as it is possible.
 *
 * @see
 *  It produces side effects!
 *  Do not use forEach() call etc, because it is fucking slow in JS,
 *  it should use only plain for loops
 *
 * @param {Number[]}  input
 * @param {Network}   network
 *
 * @returns {Network}
 */
const forwardPropagate = (input, network) => {
  const {layers} = network;
  const inputNeurons = layers[0].neuronsMatrix;

  // assign input values to network
  for (let i = inputNeurons.length - 1; i >= 0; --i)
    inputNeurons[i].value = input[i];

  for (let i = 1; i < layers.length; ++i) {
    const {
      neuronsMatrix: layerNeurons,
    } = layers[i];

    // calc activation value for each neuron in current layer
    for (let j = layerNeurons.length - 1; j >= 0; --j) {
      const neuron = layerNeurons[j];

      neuron.value = getNeuronActivationFn(neuron).plain(
        getNeuronsWeightsSum(neuron, layers[i - 1], j),
      );
    }
  }

  return network;
};

export default forwardPropagate;
