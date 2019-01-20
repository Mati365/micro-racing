import {unrollSquareMatrix2DOperation} from '../compiler';
import {unrollIdentity} from '../operations/identity';

import {unrollTranslation} from '../creators/translation';
import {unrollScale} from '../creators/scale';

import {addUnrollExecutor} from '../operations/add';
import {multiplyUnrollExecutor} from '../operations/mul';

import createMatrix from '../createMatrix';

/**
 * Creates object of unrolled square matrix operations
 *
 * @param {Object} config
 * @param {Object} additionalOperations
 */
const createMatrixOptimizedOperations = ({w, vector}, additionalOperations) => {
  const unroll = unrollSquareMatrix2DOperation(w);
  const create = m => createMatrix(w, w, m);

  return Object.assign(
    create,
    {
      ...additionalOperations,

      identity: unrollIdentity(w),

      mul: unroll(multiplyUnrollExecutor),
      add: unroll(addUnrollExecutor('+')),
      sub: unroll(addUnrollExecutor('-')),

      from: {
        translation: unrollTranslation(w, vector),
        scale: unrollScale(w, vector),
      },
    },
  );
};

export default createMatrixOptimizedOperations;
