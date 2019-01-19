import createMatrixOptimizedOperations from '../createMatrixOptimizedOperations';

import isometric from './isometric';
import perspective from './perspective';

export default createMatrixOptimizedOperations(
  4,
  {
    isometric,
    perspective,
  },
);
