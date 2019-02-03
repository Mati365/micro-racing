import * as R from 'ramda';

import createSquare from '../../../../utils/createSquare';

import unrollMatrixOperation from './unrollMatrixOperation';
import {unrollNestedArrayToVariables} from './unrollArrayToVariables';

/**
 * Optimize matrix operation, unroll all loops, and crate huge amount of variables
 *
 * @see
 *  Only for small matrices!
 *
 * @param {Dimensions} size1  Size of first matrix
 * @param {Dimensions} size2  Size of second matrix
 * @param {Function}  unrollCellFn
 *
 * @returns {Function}
 */
export const unrollMatrix2DOperation = R.curry((size1, size2, unrollCellFn) => {
  const resultSize = {
    w: size2.w,
    h: size1.h,
  };

  const code = `
  ${unrollNestedArrayToVariables('a', 'm1.array', size1.w * size1.h)}
  ${unrollNestedArrayToVariables('b', 'm2.array', size2.w * size2.h)}

  ${(() => {
    /* eslint-enable */
    let unrolledLoop = '';

    // unroll multiply operations
    for (let i = resultSize.h - 1; i >= 0; --i) {
      for (let j = resultSize.w - 1; j >= 0; --j) {
        unrolledLoop += `dest[${i * resultSize.w + j}] = ${unrollCellFn(
          {
            i,
            j,
            size1,
            size2,
          },
        )};\n`;
      }
    }

    return unrolledLoop;
  })()}
  `;

  return unrollMatrixOperation(resultSize, code);
});

/**
 * Create matrix multiplication unrolled executor for squares
 *
 * @param {Number} w
 *
 * @returns {Function}
 */
export const unrollSquareMatrix2DOperation = (w) => {
  const size = createSquare(w);

  return unrollMatrix2DOperation(size, size);
};
