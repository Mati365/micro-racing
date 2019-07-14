import * as R from 'ramda';
import pad from '@pkg/basic-helpers/base/pad';

const normalizeSegToDec = R.compose(
  pad(2),
  num => Number.parseInt(num * 255, 10).toString(16),
);

const vec3ToHex = ([r, g, b]) => (
  `#${normalizeSegToDec(r)}${normalizeSegToDec(g)}${normalizeSegToDec(b)}`
);

export default vec3ToHex;
