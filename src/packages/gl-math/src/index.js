import * as R from 'ramda';

/**
 * Creates matrix with Float32Array with given size
 *
 * @param {Number} w
 * @param {Number} h
 * @param {Number|Number[]} m
 *
 * @returns {Matrix}
 */
export const createMatrix = (w, h, m) => ({
  array: new Float32Array(
    m || (w * h),
  ),
  w,
  h,
});

/**
 * Multiply two matrices creating new matrix
 *
 * @param {Matrix} m1
 * @param {Matrix} m2
 *
 * @returns {Matrix}
 */
export const mulMatrix = (m1, m2) => {
  const result = createMatrix(m2.w, m1.h);

  for (let i = result.h - 1; i >= 0; --i) {
    for (let j = result.w - 1; j >= 0; --j) {
      let buffer = 0;

      for (let k = m2.h - 1; k >= 0; --k) {
        buffer += m1.array[i * m1.w + k] * m2.array[k * m2.w + j];
      }

      result.array[i * result.w + j] = buffer;
    }
  }

  return result;
};

/**
 * Executes eval that returns function handle
 *
 * @param {String}  strSource
 * @returns {Function}
 */
const compileFn = R.compose(
  eval, // eslint-disable-line no-eval
  source => `(() => ${source})()`,
);

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

  return compileFn(`function(m1, m2) {
  const result = this.createMatrix(${size2.w}, ${size1.h});
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

/**
 * Unrolls sum of cells
 *
 * @param {UnrollConfig}  config
 *
 * @returns {String}
 */
const multiplyUnrollExecutor = ({i, j, size1, size2}) => {
  const operations = [];

  for (let k = size2.h - 1; k >= 0; --k) {
    operations.push(
      `(a${i * size1.w + k} * b${k * size2.w + j})`,
    );
  }

  return operations.join(' + ');
};

export const mul3x3 = unrollSquareMatrixOperation(3)(multiplyUnrollExecutor);
export const mul4x4 = unrollSquareMatrixOperation(4)(multiplyUnrollExecutor);
