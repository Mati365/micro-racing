import {vec3, mat4} from '@pkg/gl-math/matrix';

/**
 * Creates 3D to 2D isometric mapping projection
 *
 * @param {Dimensions} virtualResolution
 * @param {Dimensions} dimensions
 *
 * @returns {Mat4}
 */
const createIsometricProjection = (virtualResolution, dimensions) => {
  const DIST = Math.sqrt(1.0 / 3.0);

  return mat4.mul(
    mat4.from.scaling(
      [
        virtualResolution.w / dimensions.w,
        virtualResolution.h / dimensions.h,
        1.0,
      ],
    ),
    mat4.lookAt(
      {
        eye: vec3(DIST, DIST, DIST),
        at: vec3(0.0, 0.0, 0.0),
        up: vec3(0.0, 0.0, 1.0), // Z axis is UP(window), depth testing
      },
    ),
  );
};

export default createIsometricProjection;
