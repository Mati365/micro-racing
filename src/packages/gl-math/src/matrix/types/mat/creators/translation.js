import createMatrix from '../createMatrix';
import {unrollMatrixOperation} from '../compiler';
import {timesToString} from '../../../../utils';

/**
 * Creates translation matrix
 *
 * @param {Number} w Output row/col matrix width
 * @param {Matrix} vec
 *
 * @returns {Matrix}
 *
 * @example
 *  [1, 0, 0, vx]
 *  [0, 1, 0, vy]
 *  [0, 0, 1, vz]
 *  [0, 0, 0, 1]
 */
export const translation = (w, {array: src}) => {
  const m = createMatrix(w, w);
  const {array: dest} = m;

  for (let i = w - 1; i >= 0; --i)
    dest[i * (w + 1)] = 1;

  for (let i = src.length - 1; i >= 0; --i)
    dest[w * (i + 1) - 1] = src[i];

  return m;
};

/**
 * Creates translation operation for fixed size matrix
 *
 * @param {Number} matrixWidth
 * @param {Number} vectorWidth
 *
 * @returns {Matrix}
 */
export const unrollTranslation = (matrixWidth, vectorWidth = matrixWidth) => {
  const code = `
    ${timesToString(i => `dest[${i * (matrixWidth + 1)}] = 1;`, matrixWidth)}
    ${timesToString(i => `dest[${matrixWidth * (i + 1) - 1}] = m1[${i}];`, vectorWidth)}
  `;

  return unrollMatrixOperation(
    matrixWidth,
    code,
  );
};
