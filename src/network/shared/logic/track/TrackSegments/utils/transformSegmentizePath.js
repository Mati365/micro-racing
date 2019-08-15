import * as R from 'ramda';

import {mat, vec2, vec4, vec3} from '@pkg/gl-math';
import {applyTransformsToMatrix} from '@pkg/isometric-renderer/FGL/engine/scene/types/SceneNode';

import segmentizePath from './segmentizePath';

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

const transformSegmentizePath = ({transform, segmentizeParams, path}) => segmentizePath(
  segmentizeParams,
  transform
    ? transformVec2List(applyTransformsToMatrix(transform))(path)
    : path,
);

export default transformSegmentizePath;
