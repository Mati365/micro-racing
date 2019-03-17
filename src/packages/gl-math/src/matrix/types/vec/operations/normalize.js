
import {foldUnrolledToArray} from '../../mat/compiler/unrollArrayToVariables';
import unrollVectorOperation from '../compiler/unrollVectorOperation';

import createVector from '../createVector';
import {
  length,
  unrollVecLengthAssignment,
} from './length';

/**
 * Returns normalized vector
 *
 * @param {Vector} vec
 *
 * @returns {Vector}
 */
export const normalize = (vec) => {
  const result = createVector(vec.length);
  const len = length(vec);

  for (let i = vec.length - 1; i >= 0; --i)
    result[i] = vec[i] / len;

  return result;
};

/**
 * Returns function that performs fast
 * Nth dimensions array calculation
 *
 * @param {Number} w
 *
 * @returns {Function}
 */
export const unrollNormalize = w => unrollVectorOperation(
  w,
  () => `
    var sum = ${unrollVecLengthAssignment(w)};
    if (sum > 0)
      sum = 1.0 / sum;

    return new __Vector(${foldUnrolledToArray(w, index => `a${index}*sum`)});
  `,
);
