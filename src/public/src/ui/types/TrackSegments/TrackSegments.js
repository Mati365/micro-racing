import * as R from 'ramda';

import {mat, vec2, vec4, vec3} from '@pkg/gl-math';
import {applyTransformsToMatrix} from '@pkg/isometric-renderer/FGL/engine/scene/types/SceneNode';

import segmentizePath from './utils/segmentizePath';

/**
 * Multiplies array of vec2 by matrix
 *
 * @param {Mat4} transformMatrix
 */
const transformVec2List = transformMatrix => R.map(
  (point) => {
    const output = mat.mul(
      transformMatrix,
      vec4.toMatrix(vec2.toVec4(point)),
    ).array;

    return vec3(output[0], output[1], output[2]);
  },
);

export default class TrackSegments {
  constructor({
    segmentWidth,
    interpolatedPath,
    transform = null,
  }) {
    const {path, innerPath, outerPath, segments} = segmentizePath(
      {
        width: segmentWidth,
      },
      transform
        ? transformVec2List(applyTransformsToMatrix(transform))(interpolatedPath)
        : interpolatedPath,
    );

    this.segments = segments;
    this.path = path;
    this.innerPath = innerPath;
    this.outerPath = outerPath;
  }
}
