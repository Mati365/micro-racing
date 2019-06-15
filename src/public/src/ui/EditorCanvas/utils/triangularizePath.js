import * as R from 'ramda';

import {Triangle} from '@pkg/gl-math/classes';
import expandPath from './expandPath';

/**
 * Connect fourth points into triangle
 *
 * @param {Object} config
 * @param {Vector2D[]} path
 */
const triangularizePath = ({width}, path) => {
  const [innerPath, outerPath] = expandPath(width, path);
  const triangles = [];

  for (let i = 0; i < path.length; ++i) {
    const nextIndex = (i + 1) % path.length;

    triangles.push(
      new Triangle(
        innerPath[i],
        outerPath[i],
        outerPath[nextIndex],
      ),

      new Triangle(
        outerPath[nextIndex],
        innerPath[i],
        innerPath[nextIndex],
      ),
    );
  }

  return {
    path,
    innerPath,
    outerPath,
    triangles,
  };
};

export default R.curry(triangularizePath);
