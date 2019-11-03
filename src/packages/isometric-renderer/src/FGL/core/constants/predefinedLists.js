import {vec2} from '@pkg/gl-math';

export const SQUARE_TRIANGLES_UV_LIST = Object.freeze([
  // down
  vec2(0.0, 0.0),
  vec2(1.0, 1.0),
  vec2(0.0, 1.0),

  // uper
  vec2(1.0, 0.0),
  vec2(1.0, 1.0),
  vec2(0.0, 1.0),
]);

/**
 * v1 --- v3
 *  |     |
 * v2 --- v4
 */
export const SQUARE_TRIANGLES_STRIP_UV_LIST = Object.freeze([
  vec2(0.0, 0.0),
  vec2(0.0, 1.0),
  vec2(1.0, 0.0),
  vec2(1.0, 1.0),
]);
