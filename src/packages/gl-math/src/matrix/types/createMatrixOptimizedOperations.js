import {unrollSquareMatrix2DOperation} from '../compiler';

import {unrollIdentity} from '../creators/identity';
import {unrollTranslation} from '../creators/translation';
import {unrollScaling} from '../creators/scaling';

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

      mul: unroll(multiplyUnrollExecutor),
      add: unroll(addUnrollExecutor('+')),
      sub: unroll(addUnrollExecutor('-')),

      from: {
        translation: unrollTranslation(w, vector),
        scaling: unrollScaling(w, vector),
        identity: unrollIdentity(w),
      },
    },
  );
};

export default createMatrixOptimizedOperations;
