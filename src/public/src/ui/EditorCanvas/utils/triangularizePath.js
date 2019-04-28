import {Triangle} from '@pkg/gl-math/matrix/types/vec/classes';
import expandPath from './expandPath';

/**
 * Connect fourth points into triangle
 *
 * @param {Object} config
 * @param {Vector2D[]} path
 */
const triangularizePath = ({width}, path) => {
  const outerPath = expandPath(width, path);
  const triangles = [];

  for (let i = 0; i < path.length; ++i) {
    const nextIndex = (i + 1) % path.length;

    triangles.push(
      new Triangle(
        path[i],
        outerPath[i],
        outerPath[nextIndex],
      ),

      new Triangle(
        outerPath[i],
        path[i],
        path[nextIndex],
      ),
    );
  }

  return {
    outerPath,
    triangles,
  };
};

export default triangularizePath;
