import * as R from 'ramda';

import {vec2} from '@pkg/gl-math/matrix';
import convexHull from '@pkg/convex-hull';
import {getRandomPoint} from '@pkg/basic-helpers/base/random';

/**
 * Creates array of points on racing map
 *
 * @param {Size} area
 * @param {Number} randomPointsCount
 *
 * @param {Point} border
 *
 * @returns {Array}
 */
export const generateAreaPoints = R.curry(
  (border, randomPointsCount, area) => {
    const points = R.times(
      R.partial(getRandomPoint, [border, area]),
      randomPointsCount,
    );

    return points;
  },
);

/**
 * Due to catmull interpolation, some points might be "looped",
 * drop them, it will help also randomCurves function
 *
 * @param {Object} config
 *
 * @returns {vec2[]}
 */
export const dropNearPoints = ({minDistance}) => (points) => {
  const buffer = [...points];

  for (let i = 0; i < buffer.length;) {
    const nextIndex = (i + 1) % buffer.length;
    if (vec2.dist(buffer[i], buffer[nextIndex]) >= minDistance)
      i++;
    else
      buffer.splice(nextIndex, 1);
  }

  return buffer;
};

/**
 * Generate array of points from provided area size
 *
 * @param {Rect} area
 */
const generateRandomRoad = (area) => {
  const points = R.compose(
    convexHull,
    dropNearPoints(
      {
        minDistance: 32,
      },
    ),
    generateAreaPoints(
      {
        x: 100,
        y: 100,
      },
      20,
    ),
  )(area);

  return points;
};

export default generateRandomRoad;
