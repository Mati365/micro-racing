import createVectorOptimizedOperations from '../createVectorOptimizedOperations';

import rotate from './operations/rotate';
import orthogonal from './operations/orthogonal';

export default createVectorOptimizedOperations(
  2,
  {
    rotate,
    orthogonal,
  },
);
