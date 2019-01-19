import {unrollSquareMatrix2DOperation} from '../compiler';
import {unrollTranslation} from '../operations/translation';
import {unrollIdentity} from '../operations/identity';

import {addUnrollExecutor} from '../operations/add';
import {multiplyUnrollExecutor} from '../operations/mul';

import createMatrix from '../createMatrix';

/**
 * Creates object of unrolled square matrix operations
 *
 * @param {Number} w
 */
const createMatrixOptimizedOperations = (w, additionalOperations) => {
  const unroll = unrollSquareMatrix2DOperation(w);
  const create = m => createMatrix(w, w, m);

  return Object.assign(
    create,
    {
      ...additionalOperations,

      mul: unroll(multiplyUnrollExecutor),
      add: unroll(addUnrollExecutor('+')),
      sub: unroll(addUnrollExecutor('-')),

      translation: unrollTranslation(w, w),
      identity: unrollIdentity(w),
    },
  );
};

export default createMatrixOptimizedOperations;
