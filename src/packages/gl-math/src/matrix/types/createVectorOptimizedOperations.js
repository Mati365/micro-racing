import {unrollLength} from './vec/operations/length';
import {unrollNormalize} from './vec/operations/normalize';
import {unrollLerp} from './vec/operations/lerp';

/**
 * Creates object of unrolled square vector operations
 *
 * @param {Number} w  Width
 * @param {Object} additionalOperations
 */
const createVectorOptimizedOperations = (w, additionalOperations) => {
  const create = data => new Float32Array(data, 0, w);

  return Object.assign(
    create,
    {
      ...additionalOperations,

      len: unrollLength(w),
      lerp: unrollLerp(w),
      normalize: unrollNormalize(w),
    },
  );
};

export default createVectorOptimizedOperations;
