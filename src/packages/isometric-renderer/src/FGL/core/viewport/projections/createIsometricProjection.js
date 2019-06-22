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

  return mat4.compose.mul(
    mat4.ortho(
      {
        left: -1,
        right: 1,
        bottom: -1,
        top: 1,
        near: 1,
        far: -1,
      },
    ),
    mat4.lookAt(
      {
        eye: vec3(DIST, DIST, DIST),
        at: vec3(0.0, 0.0, 0.0),
        up: vec3(0.0, 0.0, 1.0), // Z axis is UP(window), depth testing
      },
    ),
    mat4.from.scaling(
      [
        virtualResolution.w / dimensions.w,
        virtualResolution.h / dimensions.h,
        0.01, // prevent z-depth truncating
      ],
    ),
  );
};

export default createIsometricProjection;
