import * as R from 'ramda';
import unrollVectorOperation from '../compiler/unrollVectorOperation';

/**
 * Returns length of array of numbers
 *
 * @param {Vector} vec
 *
 * @returns {Number}
 */
export const length = (vec) => {
  let sum = 0;

  for (let i = vec.length - 1; i >= 0; --i) {
    const c = vec[i];
    sum += c * c; // do not use **, it is slower
  }

  return Math.sqrt(sum);
};

/**
 * Returns array of sum operator of vector items
 *
 * @example
 *  unrollLengthSum(2) => a0*a0 + a1*a1
 *
 * @param {Number} w
 *
 * @returns {String}
 */
export const unrollVecLengthAssignment = (w) => {
  const sum = R.join(
    ' + ',
    R.times(
      index => `a${index}*a${index}`,
      w,
    ),
  );

  return `Math.sqrt(${sum})`;
};

/**
 * Returns function that performs fast
 * Nth dimensions vector items sum
 *
 * @param {Number} w
 *
 * @returns {Function}
 */
export const unrollLength = w => unrollVectorOperation(
  w,
  () => `return ${unrollVecLengthAssignment(w)};`,
);
