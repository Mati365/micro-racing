import createVectorOptimizedOperations from '../createVectorOptimizedOperations';
import rotate from './operations/rotate';

export default createVectorOptimizedOperations(
  2,
  {
    rotate,
  },
);
