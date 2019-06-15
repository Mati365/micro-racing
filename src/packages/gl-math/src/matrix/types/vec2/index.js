import createVectorOptimizedOperations from '../createVectorOptimizedOperations';

import vec3 from '../vec3';

import rotate from './operations/rotate';
import orthogonal from './operations/orthogonal';
import fromScalar from './operations/fromScalar';

export default createVectorOptimizedOperations(
  2,
  {
    rotate,
    orthogonal,
    fromScalar,
    toVec3(vec) { return vec3(vec[0], vec[1], 0); },
  },
);
