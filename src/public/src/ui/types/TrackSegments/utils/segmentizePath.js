import * as R from 'ramda';

import {vec2, vec3} from '@pkg/gl-math';

import {Triangle} from '@pkg/gl-math/classes';
import expandPath from './expandPath';

export class TrackSegment {
  constructor(index, width, triangles, point, vector) {
    this.index = index;
    this.width = width;
    this.triangles = triangles;
    this.point = point;
    this.vector = vector;
    this.angle = vec2.vectorAngle(vec2.normalize(vector));
  }
}

/**
 * Connect fourth points into triangle
 *
 * @param {Object} config
 * @param {Vector2D[]} path
 */
const segmentizePath = ({width}, path) => {
  const [innerPath, outerPath] = expandPath(width, path);
  const segments = [];

  for (let i = 0; i < path.length; ++i) {
    const nextIndex = (i + 1) % path.length;
    const triangles = [
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
    ];

    segments.push(
      new TrackSegment(
        i,
        width,
        triangles,
        path[i],
        vec3.sub(path[nextIndex], path[i]),
      ),
    );
  }

  return {
    segments,
    path,
    innerPath,
    outerPath,
  };
};

export default R.curry(segmentizePath);
