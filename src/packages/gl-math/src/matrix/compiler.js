import * as R from 'ramda';
import createMatrix from './createMatrix';

/**
 * Translates array with fixed length to single variable definitions
 *
 * @example
 *  var array = [1, 2, 3];
 *  // unrollArrayToVariables('a', 'array')(3), is transformed to:
 *  var a0 = array[0], a1 = array[1], a2 = array[2];
 *
 * @param {String} variableNamePrefix
 * @param {String} arrayVariableName
 * @param {Number} length
 *
 * @returns {String}
 */
const unrollArrayToVariables = (variableNamePrefix, arrayVariableName) => R.compose(
  definitions => `const ${definitions};`,
  R.join(','),
  R.times(
    index => `${variableNamePrefix}${index} = ${arrayVariableName}[${index}]`,
  ),
);

/**
 * Create nested path array accessor and execute unrollArrayToVariables
 *
 * @param {String} variableNamePrefix
 * @param {String} arrayPath
 * @param {Number} length
 *
 * @returns {String}
 */
const unrollNestedArrayToVariables = (variableNamePrefix, arrayPath, length) => {
  const tmpAccessorName = `a_${variableNamePrefix}`;

  return R.trim(`
    const ${tmpAccessorName} = ${arrayPath};
    ${unrollArrayToVariables(variableNamePrefix, tmpAccessorName)(length)}
  `);
};

/**
 * Optimize matrix operation, unroll all loops, and crate huge amount of variables
 *
 * @see
 *  Only for small matrices!
 *
 * @param {Dimensions} size1
 * @param {Dimensions} size2
 * @param {Function}  unrollCellFn
 *
 * @returns {Function}
 */
export const unrollMatrixOperation = R.curry((size1, size2, unrollCellFn) => {
  const resultSize = {
    w: size2.w,
    h: size1.h,
  };

  const _createMatrix = createMatrix; // eslint-disable-line
  const compileFn = source => eval(`(function() {return ${source}})()`); // eslint-disable-line

  return compileFn(`function(m1, m2) {
  const result = _createMatrix(${size2.w}, ${size1.h});
  const {array: dest} = result;

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
  return result;
  }`);
});

/**
 * Create matrix multiplication unrolled executor for squares
 *
 * @param {Number} w
 *
 * @returns {Function}
 */
export const unrollSquareMatrixOperation = (w) => {
  const size = {
    w,
    h: w,
  };

  return unrollMatrixOperation(size, size);
};
