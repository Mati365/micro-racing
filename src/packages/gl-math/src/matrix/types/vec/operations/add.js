import {foldUnrolledToArray} from '../../mat/compiler/unrollArrayToVariables';
import createVector from '../createVector';

/**
 * Adds two vectors, sign allows to sub
 *
 * @param {Vector} vec1
 * @param {Vector} vec2
 *
 * @returns {Vector}
 */
export const add = (vec1, vec2, sign = 1) => {
  const result = createVector(vec1.length);

  for (let i = vec1.length - 1; i >= 0; --i)
    result[i] = vec1[i] + (sign * vec2[i]);

  return result;
};

/**
 * @param {Number} w
 * @param {Number} sign
 *
 * @returns {Function}
 */
export const unrollAdd = (w, sign = 1) => {
  const operations = foldUnrolledToArray(
    w,
    index => `vec1[${index}] ${sign > 0 ? '+' : '-'} vec2[${index}]`,
  );

  /* eslint-disable no-new-func */
  return new Function(
    'vec1',
    'vec2',
    `
      return new __Vector(${operations});
    `,
  );
  /* eslint-enable no-new-func */
};

export const unrollSub = w => unrollAdd(w, -1);
