import createVectorOptimizedOperations from '../createVectorOptimizedOperations';

// fixme: propably circular dependency
import vec3 from '../vec3';
import vec4 from '../vec4';

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
    toVec4(vec) { return vec4(vec[0], vec[1], 0, 1.0); },
  },
);
