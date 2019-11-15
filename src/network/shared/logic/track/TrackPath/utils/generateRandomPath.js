import * as R from 'ramda';

import {getPathCornersBox, vec2} from '@pkg/gl-math';
import {getRandomPoint} from '@pkg/basic-helpers/base/random';
import convexHull from '@pkg/convex-hull';

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
 * @param {Vec2} moveToOrigin If true moves whole track to origin
 *
 * @param {Rect} area
 */
const generateRandomPath = (area, moveToOrigin = vec2(area.w * 0.4, area.h * 0.4)) => {
  const points = R.compose(
    dropNearPoints(
      {
        minDistance: area.w * 0.15,
      },
    ),
    convexHull,
    generateAreaPoints(
      {
        x: area.w * 0.1,
        y: area.h * 0.1,
      },
      32,
    ),
  )(area);

  if (moveToOrigin) {
    const {topLeft} = getPathCornersBox(points);

    R.forEach(
      (point) => {
        point[0] -= topLeft.x - moveToOrigin.x;
        point[1] -= topLeft.y - moveToOrigin.y;
      },
      points,
    );
  }

  return points;
};

export default generateRandomPath;
