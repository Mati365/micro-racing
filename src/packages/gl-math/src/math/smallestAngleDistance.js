import {RAD_360} from './wrapAngleTo2PI';

/**
 * Smallest angle distance
 *
 * @see
 *  {@link https://stackoverflow.com/a/2007279/6635215}
 *  {@link https://gist.github.com/shaunlebron/8832585}
 */
const smallestAngleDistance = (a, b) => {
  const da = (b - a) % RAD_360;
  return ((2 * da) % RAD_360) - da;
};

export default smallestAngleDistance;
