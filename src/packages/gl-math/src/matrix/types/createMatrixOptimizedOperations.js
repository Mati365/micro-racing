import {unrollSquareMatrix2DOperation} from './mat/compiler';
import baseOperations from './mat';

import {unrollIdentity} from './mat/creators/identity';
import {unrollTranslation} from './mat/creators/translation';
import {unrollScaling} from './mat/creators/scaling';

import composeOperations from './composeOperations';
import {addUnrollExecutor} from './mat/operations/add';
import {multiplyUnrollExecutor} from './mat/operations/mul';

const {create: createMatrix} = baseOperations;

/**
 * Creates object of unrolled square matrix operations
 *
 * @param {Object} config
 * @param {Object} additionalOperations
 */
const createMatrixOptimizedOperations = ({w, vector}, {operations, creators} = {}) => {
  const unroll2D = unrollSquareMatrix2DOperation(w);
  const create = m => createMatrix(w, w, m);

  const unrolledMul = unroll2D(multiplyUnrollExecutor);

  return Object.assign(
    create,
    {
      ...operations,
      ...baseOperations,

      mul: unrolledMul,
      add: unroll2D(addUnrollExecutor('+')),
      sub: unroll2D(addUnrollExecutor('-')),

      compose: {
        mul: composeOperations(unrolledMul),
      },

      from: {
        translation: unrollTranslation(w, vector),
        scaling: unrollScaling(w, vector),
        identity: unrollIdentity(w),

        ...creators,
      },
    },
  );
};

export default createMatrixOptimizedOperations;
