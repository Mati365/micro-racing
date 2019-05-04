import createVectorOptimizedOperations from '../createVectorOptimizedOperations';

import rotate from './operations/rotate';
import orthogonal from './operations/orthogonal';
import fromScalar from './operations/fromScalar';

export default createVectorOptimizedOperations(
  2,
  {
    rotate,
    orthogonal,
    fromScalar,
  },
);
