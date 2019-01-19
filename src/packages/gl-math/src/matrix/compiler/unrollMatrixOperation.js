import * as R from 'ramda';

import createMatrix from '../createMatrix';
import {createSquare} from '../../utils';

/**
 * @see
 *  Only for small matrices!

 * @param {Number|Dimensions} size Size of result, if number - square
 * @param {String} unrollOperation
 *
 * @returns {Function}
 */
const unrollMatrixOperation = (size, unrollOperation) => {
  const resultSize = (
    R.is(Number, size)
      ? createSquare(size)
      : size
  );

  // fix eval() context issues
  const _createMatrix = createMatrix; // eslint-disable-line
  const compileFn = source => eval(`(function() {return ${source}})()`); // eslint-disable-line

  return compileFn(`function(m1, m2) {
    var result = _createMatrix(${resultSize.w}, ${resultSize.h});
    var dest = result.array;

    ${unrollOperation}

    return result;
  }`);
};

export default R.curry(unrollMatrixOperation);
