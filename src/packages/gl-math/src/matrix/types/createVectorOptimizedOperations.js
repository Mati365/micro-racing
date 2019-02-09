import unrollVectorCreator from './vec/compiler/unrollVectorCreator';

import {unrollLength} from './vec/operations/length';
import {unrollNormalize} from './vec/operations/normalize';
import {unrollLerp} from './vec/operations/lerp';
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

      len: unrollLength(w),
      lerp: unrollLerp(w),
      normalize: unrollNormalize(w),
    },
  );
};

export default createVectorOptimizedOperations;
