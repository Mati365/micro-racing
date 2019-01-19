import createMatrix from '../createMatrix';

/**
 * Adds two matrices creating new matrix
 *
 * @param {Matrix} m1
 * @param {Matrix} m2
 * @param {Number} sign
 *
 * @returns {Matrix}
 */
export const add = (m1, m2, sign = 1) => {
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
export const sub = (m1, m2) => add(m1, m2, -1);

/**
 * Performs sum of two cell
 *
 * @param {String} operator
 * @param {UnrollConfig}  config
 *
 * @returns {String}
 */
export const addUnrollExecutor = (operator = '+') => ({i, j, size1}) => {
  const index = i * size1.w + j;
  return `a${index} ${operator} b${index}`;
};
