import * as R from 'ramda';

/**
 * Dumps whole array network to 1D arrays.
 * Used to generate genes
 *
 * @param {NeuralNetwork} neural
 *
 * @returns {1DNeuralNetwork} neural network with 1D arrays
 */
export const dumpTo1D = (neural) => {
  const {layers} = neural;
  const biases = [];
  let weights = [];

  for (let i = 0; i < layers.length; ++i) {
    const {
      neuronsMatrix,
      weightsMatrix,
    } = layers[i];

    // map biases, ignore input layer
    if (i) {
      for (let j = 0; j < neuronsMatrix.length; ++j) {
        const neuron = neuronsMatrix[j];
        biases.push(neuron.bias);
      }
    }

    // map weights, ignore output layer
    if (weightsMatrix) {
      for (let j = 0; j < weightsMatrix.length; ++j)
        weights = weights.concat(weightsMatrix[j]);
    }
  }

  return {
    biases,
    weights,
  };
};

/**
 * Loads 1D neural network to 2D neural network
 *
 * @param {NeuralNetwork}   neuralSchema  It is not modified, it only contains schema
 * @param {1DNeuralNetwork} data
 *
 * @returns {NeuralNetwork}
 */
export const restoreFrom1D = R.curry(
  (neuralSchema, data) => {
    const clonedNeural = R.clone(neuralSchema);
    const {layers} = clonedNeural;

    let [biasOffset, weightsOffset] = [0, 0];

    for (let i = 0; i < layers.length; ++i) {
      const {
        neuronsMatrix,
        weightsMatrix,
      } = layers[i];

      // map biases, ignore input layer
      if (i) {
        for (let j = 0; j < neuronsMatrix.length; ++j, ++biasOffset) {
          neuronsMatrix[j].bias = data.biases[biasOffset];
        }
      }

      // map weights, ignore output layer
      if (weightsMatrix) {
        for (let j = 0; j < weightsMatrix.length; ++j) {
          const rowWidth = weightsMatrix[j].length;

          weightsMatrix[j] = data.weights.slice(weightsOffset, weightsOffset + rowWidth);
          weightsOffset += rowWidth;
        }
      }
    }

    return clonedNeural;
  },
);
