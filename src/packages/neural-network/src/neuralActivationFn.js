import * as R from 'ramda';

const reduceObjectToArray = obj => R.reduce(
  (acc, [index, fn]) => {
    acc[index] = fn;
    return acc;
  },
  [],
  R.toPairs(obj),
);

/**
 * @see
 * https://en.wikipedia.org/wiki/Activation_function
 * https://pl.wikipedia.org/wiki/Funkcja_aktywacji
 * https://stevenmiller888.github.io/mind-how-to-build-a-neucral-network/
 */
export const NEURAL_ACTIVATION_TYPES = {
  TAN_H: 0,
  SIGMOID_UNIPOLAR: 1,
  SIGMOID_BIPOLAR: 2,
  RELU: 3,
};

const NeuralActivationFn = {
  [NEURAL_ACTIVATION_TYPES.RELU]: {
    plain: x => Math.max(0, x),
    derivative: x => +(x > 0), // x > 0 => 1, x <= 0 => 0
  },

  [NEURAL_ACTIVATION_TYPES.TAN_H]: {
    plain: Math.tanh,
    derivative: x => 1 / (Math.cosh(x) ** 2),
  },

  /**
   * @see
   * http://www.aforgenet.com/framework/docs/html/c4a0095a-0465-4931-63e7-4c0cdbe2eacc.htm
   */
  [NEURAL_ACTIVATION_TYPES.SIGMOID_UNIPOLAR]: (() => {
    const plain = (x, B = 1) => 1 / (1 + Math.exp((-B) * x));
    return {
      plain,
      derivative: (x, B) => {
        const fx = plain(x, B);
        return fx * (1 - fx);
      },
    };
  })(),

  [NEURAL_ACTIVATION_TYPES.SIGMOID_BIPOLAR]: (() => {
    const plain = (x, B = 1) => {
      const expVal = Math.exp((-B) * x);
      return (1 - expVal) / (1 + expVal);
    };

    return {
      plain,
      derivative: (x, B) => (1 - (plain(x, B) ** 2)),
    };
  })(),
};

/**
 * Reduce object to array, it should be generally
 * faster than searching function via string key
 */
export default reduceObjectToArray(NeuralActivationFn);
