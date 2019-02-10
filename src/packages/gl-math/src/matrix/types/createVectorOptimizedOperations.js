import unrollVectorCreator from './vec/compiler/unrollVectorCreator';

import createMatrix from './mat/createMatrix';
import {unrollLength} from './vec/operations/length';
import {unrollNormalize} from './vec/operations/normalize';
import {unrollLerp} from './vec/operations/lerp';
import {unrollMul} from './vec/operations/mul';
import {
  unrollAdd,
  unrollSub,
} from './vec/operations/add';

/**
 * Creates object of unrolled square vector operations
 *
 * @param {Number} w  Width
 * @param {Object} additionalOperations
 */
const createVectorOptimizedOperations = (w, additionalOperations) => {
  const create = unrollVectorCreator(w);

  return Object.assign(
    create,
    {
      ...additionalOperations,

      add: unrollAdd(w),
      sub: unrollSub(w),
      mul: unrollMul(w),
      negate: unrollMul(w, -1),

      len: unrollLength(w),
      lerp: unrollLerp(w),
      normalize: unrollNormalize(w),

      toMatrix: vec => createMatrix(1, w, vec),
    },
  );
};

export default createVectorOptimizedOperations;
