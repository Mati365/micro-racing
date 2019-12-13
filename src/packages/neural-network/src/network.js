import * as R from 'ramda';

import createMatrix from './createMatrix';
import {createNeuronsVector} from './neuron';

/**
 * Generates random biases for neural network
 *
 * @see
 *  createNeuralNetwork
 *
 * @todo
 *  check if random biases generated that way will work
 *  correctly with other activation functions(hope it will)
 */
export const getRandomBias = () => (Math.random() * 2.0) - 1.0;

/**
 * Create layer descriptor used in createNeuralNetwork function
 *
 * @param {Function}    activationFn
 * @param {Number[][]}  weights
 * @param {Number}      size
 *
 * @returns {LayerDescriptor}
 */
export const createLayer = R.curryN(
  2, (activationFn, size, weights = null) => ({
    size,
    activationFn,
    weights,
  }),
);

export const createInputLayer = createLayer(null);

/**
 * Creates neural network with matrices
 *
 * @param {LayerDescriptor[]} layerDescriptors
 * @returns {Network}
 */
export const createNeuralNetwork = layersDescriptors => ({
  layers: R.addIndex(R.map)(
    (
      {
        size: layerSize,
        activationFn,
        neurons,
        weights,
      },
      layerIndex,
    ) => {
      const outputLayer = layerIndex + 1 === layersDescriptors.length;
      const inputLayer = !layerIndex;

      return {
        // input layer should not have activation function
        neuronsMatrix: neurons || createNeuronsVector(
          layerSize,
          inputLayer
            ? null
            : activationFn, // receives neuron index due to times() call in createVector
        ),

        // output layer should not have weights
        weightsMatrix: weights || (
          outputLayer
            ? null
            : createMatrix(layerSize, layersDescriptors[layerIndex + 1].size, getRandomBias)
        ),
      };
    },
    layersDescriptors, // drop last
  ),
});

/**
 * Returns output vector from neural network
 *
 * @param {Network} network
 * @returns {Number[]}
 */
export const getNetworkOutput = R.compose(
  R.pluck('value'),
  R.prop('neuronsMatrix'),
  R.last,
  R.prop('layers'),
);
