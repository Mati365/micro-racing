import unrollVectorCreator from './vec/compiler/unrollVectorCreator';

import createMatrix from './mat/createMatrix';
import {unrollLength} from './vec/operations/length';
import {unrollNormalize} from './vec/operations/normalize';
import {unrollLerp} from './vec/operations/lerp';
import {unrollMul} from './vec/operations/mul';
import {unrollDiv} from './vec/operations/div';
import {unrollDistance} from './vec/operations/distance';
import {
  unrollAdd,
  unrollSub,
} from './vec/operations/add';
import composeOperations from './composeOperations';

import Vector from '../../classes/Vector';

/**
 * Creates object of unrolled square vector operations
 *
 * @param {Number} w  Width
 * @param {Object} additionalOperations
 */
const createVectorOptimizedOperations = (w, additionalOperations) => {
  const create = unrollVectorCreator(w);
  const unrolledAdd = unrollAdd(w);

  return Object.assign(
    create,
    {
      ...additionalOperations,

      add: unrolledAdd,
      sub: unrollSub(w),
      mul: unrollMul(w),
      div: unrollDiv(w),
      negate: unrollMul(w, -1),
      dist: unrollDistance(w),
      equals: (a, b) => a.equals(b),

      clone: array => new Vector(array),
      len: unrollLength(w),
      lerp: unrollLerp(w),
      normalize: unrollNormalize(w),

      compose: {
        add: composeOperations(unrolledAdd),
      },

      toMatrix: vec => createMatrix(1, w, vec),
    },
  );
};

export default createVectorOptimizedOperations;
