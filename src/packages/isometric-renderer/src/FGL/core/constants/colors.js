import * as R from 'ramda';

import {vec4} from '@pkg/gl-math/matrix';
import vec3ToHex from '../utils/vec3ToHex';

const PALETTE = {
  WHITE: vec4(1.0, 1.0, 1.0, 1.0),
  BLACK: vec4(0.0, 0.0, 0.0, 1.0),
  RED: vec4(1.0, 0.0, 0.0, 1.0),
  GREEN: vec4(0.0, 1.0, 0.0, 1.0),
  BLUE: vec4(0.0, 0.0, 1.0, 1.0),
  ORANGE: vec4(1.0, 0.27, 0.0, 1.0),
  YELLOW: vec4(1, 0.984, 0.701, 1.0),
  DARK_GRAY: vec4(0.2, 0.2, 0.2, 1.0),
  TRANSPARENT: vec4(0.0, 0.0, 0.0, 1.0),
  PURPLE: vec4(0.5, 0.0, 0.5, 1.0),
};

export const hex = R.mapObjIndexed(
  vec3ToHex,
  PALETTE,
);

export default {
  ...PALETTE,
  hex,
};
