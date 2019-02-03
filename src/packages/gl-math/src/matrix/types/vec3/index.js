import createVectorOptimizedOperations from '../createVectorOptimizedOperations';

import cross from './operations/cross';
import dot from './operations/dot';

export default createVectorOptimizedOperations(
  3,
  {
    cross,
    dot,
  },
);
