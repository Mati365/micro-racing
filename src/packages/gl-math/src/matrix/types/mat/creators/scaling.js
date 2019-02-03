import createMatrix from '../createMatrix';
import {unrollMatrixOperation} from '../compiler';
import {timesToString} from '../../../../utils';

/**
 * Creates scale matrix
 *
 * @param {Number} w Output row/col matrix width
 * @param {Number[]} vec
 *
 * @returns {Matrix}
 *
 * @example
 *  [sX, 0, 0, 0]
 *  [0, sY, 0, 0]
 *  [0, 0, sX, 0]
 *  [0, 0, 0, 1]
 */
export const scaling = (w, src) => {
  const m = createMatrix(w, w);
  const {array: dest} = m;

  for (let i = src.length - 1; i >= 0; --i)
    dest[i * (w + 1)] = src[i];

  // fill rest non scaled dimensions with 1
  for (let i = w - 1; i >= src.length; --i)
    dest[i * (w + 1)] = 1;

  return m;
};

/**
 * Creates scale operation for fixed size matrix
 *
 * @param {Number} matrixWidth
 * @param {Number} vectorWidth
 *
 * @returns {Matrix}
 */
export const unrollScaling = (matrixWidth, vectorWidth = matrixWidth) => {
  const mapper = i => `dest[${i * (matrixWidth + 1)}] = ${i >= vectorWidth ? 1 : `m1[${i}]`};`;

  return unrollMatrixOperation(
    matrixWidth,
    timesToString(mapper, matrixWidth),
  );
};
