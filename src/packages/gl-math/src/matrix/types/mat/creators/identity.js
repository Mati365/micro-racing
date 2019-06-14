import createMatrix from '../createMatrix';
import cloneMatrix from '../cloneMatrix';

/**
 * @param {Number} w
 *
 * @example
 *  [1, 0, 0, 0]
 *  [0, 1, 0, 0]
 *  [0, 0, 1, 0]
 *  [0, 0, 0, 1]
 */
export const identity = (w) => {
  const size = w ** 2;
  const m = new Float32Array(size);

  for (let i = w - 1; i >= 0; --i)
    m[i * (w + 1)] = 1;

  return createMatrix(w, w, m);
};


/**
 * Creates cached identity operator
 *
 * @param {Number} w
 *
 * @returns {Matrix}
 */
export const unrollIdentity = (w) => {
  const SOURCE_MATRIX = Object.freeze(identity(w));

  return () => cloneMatrix(SOURCE_MATRIX);
};
