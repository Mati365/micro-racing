import {vec2, vec3} from '@pkg/gl-math';

/**
 * Calculates angle and position car on map segment
 *
 * @param {Segments[]} segments
 * @param {Number} segmentIndex
 * @param {Object} transform
 *
 * @returns {Object}
 */
export const CAR_ALIGN = {
  CENTER: 0,
  LEFT_CORNER: 1,
  RIGHT_CORNER: -1,
};

const genCarSegmentTransform = ({
  segment,
  align = CAR_ALIGN.LEFT_CORNER,
} = {}) => {
  const point = vec3.add(
    segment.point,
    vec2.toVec3(
      vec2.fromScalar(align * segment.width / 2, segment.angle),
      0.0,
    ),
  );

  return {
    rotate: [0, 0, segment.angle],
    translate: point,
  };
};

export default genCarSegmentTransform;
