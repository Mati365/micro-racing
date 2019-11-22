import * as R from 'ramda';

import {SQUARE_TRIANGLES_UV_LIST} from '@pkg/isometric-renderer/FGL/core/constants/predefinedLists';

import {vec2, vec3, toRadians} from '@pkg/gl-math';

import {Triangle} from '@pkg/gl-math/classes';
import expandPath from './expandPath';

const plainVertexList = R.compose(
  R.unnest,
  R.map(triangle => triangle.toVertexList()),
);

export class TrackSegment {
  constructor(index, width, triangles, point, vector) {
    this.index = index;
    this.width = width;
    this.triangles = triangles;
    this.point = point;

    this.vector = vector;
    this.normalizedVector = vec2.normalize(vector);

    this.angle = vec2.vectorAngle(this.normalizedVector) + toRadians(90);
  }

  toTrianglesVertexList() {
    return plainVertexList(this.triangles);
  }

  /* eslint-disable class-methods-use-this */
  toTrianglesUVList() {
    return SQUARE_TRIANGLES_UV_LIST;
  }
  /* eslint-enable class-methods-use-this */
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
