import createMatrix from '../createMatrix';
import {unrollSquareMatrixOperation} from '../compiler';

/**
 * Adds two matrices creating new matrix
 *
 * @param {Matrix} m1
 * @param {Matrix} m2
 * @param {Number} sign
 *
 * @returns {Matrix}
 */
export const addMatrix = (m1, m2, sign = 1) => {
  const result = createMatrix(m2.w, m1.h);

  for (let i = result.h - 1; i >= 0; --i) {
    for (let j = result.w - 1; j >= 0; --j) {
      const index = i * result.w + j;
      result.array[index] = m1.array[index] + (sign * m2.array[index]);
    }
  }

  return result;
};

/**
 * Subs two matrices creating new matrix
 *
 * @param {Matrix} m1
 * @param {Matrix} m2
 * @param {Number} sign
 *
 * @returns {Matrix}
 */
export const subMatrix = (m1, m2) => addMatrix(m1, m2, -1);

/**
 * Performs sum of two cell
 *
 * @param {String} operator
 * @param {UnrollConfig}  config
 *
 * @returns {String}
 */
const addUnrollExecutor = (operator = '+') => ({i, j, size1}) => {
  const index = i * size1.w + j;
  return `a${index} ${operator} b${index}`;
};

export const add3x3 = unrollSquareMatrixOperation(3)(addUnrollExecutor('-'));
export const add4x4 = unrollSquareMatrixOperation(4)(addUnrollExecutor('-'));

export const sub3x3 = unrollSquareMatrixOperation(3)(addUnrollExecutor('+'));
export const sub4x4 = unrollSquareMatrixOperation(4)(addUnrollExecutor('+'));
