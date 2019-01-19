import createMatrix from '../createMatrix';
import {unrollMatrixOperation} from '../compiler';
import {timesToString} from '../../utils';

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
const translation = (w, {array: src}) => {
  const m = createMatrix(w, w);
  const {array: dest} = m;

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
    const {array: src} = m1;
    ${timesToString(i => `dest[${i * (matrixWidth + 1)}] = 1;`, matrixWidth)}
    ${timesToString(i => `dest[${matrixWidth * (i + 1) - 1}] = src[${i}];`, vectorWidth)}
  `;

  return unrollMatrixOperation(
    matrixWidth,
    code,
  );
};

export default translation;
