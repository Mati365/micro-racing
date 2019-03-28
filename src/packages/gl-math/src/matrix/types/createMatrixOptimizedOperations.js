import {unrollSquareMatrix2DOperation} from './mat/compiler';
import createMatrix from './mat/createMatrix';

import {unrollIdentity} from './mat/creators/identity';
import {unrollTranslation} from './mat/creators/translation';
import {unrollScaling} from './mat/creators/scaling';

import {addUnrollExecutor} from './mat/operations/add';
import {multiplyUnrollExecutor} from './mat/operations/mul';

/**
 * It is faster than array
 *
 * @param {Function} createFn
 * @param {Function} operationFn
 */
const compose = (createFn, operationFn) => (m1, m2, m3, m4) => {
  let dest = createFn(m1.array);

  if (m2) {
    dest = operationFn(m2, dest, dest);

    if (m3) {
      dest = operationFn(m3, dest, dest);

      if (m4) {
        dest = operationFn(m4, dest, dest);
      }
    }
  }

  return dest;
};

/**
 * Creates object of unrolled square matrix operations
 *
 * @param {Object} config
 * @param {Object} additionalOperations
 */
const createMatrixOptimizedOperations = ({w, vector}, {operations, creators} = {}) => {
  const unroll = unrollSquareMatrix2DOperation(w);
  const create = m => createMatrix(w, w, m);

  const unrolledMul = unroll(multiplyUnrollExecutor);

  return Object.assign(
    create,
    {
      ...operations,

      mul: unrolledMul,
      add: unroll(addUnrollExecutor('+')),
      sub: unroll(addUnrollExecutor('-')),

      compose: {
        mul: compose(create, unrolledMul),
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
