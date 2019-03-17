import * as R from 'ramda';

import {vec2} from '@pkg/gl-math/matrix';
import convexHull from '@pkg/convex-hull';
import catmull from '@pkg/catmull';

/**
 * Returns random int between min and max, includes min and max
 *
 * @param {Number} min
 * @param {Number} max
 *
 * @returns {Number}
 */
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Gets array of points on certain area
 *
 * @param {Size} areaSize
 * @param {Point} border
 *
 * @returns {Array[]} points
 */
const getRandomPoint = (border, areaSize) => {
  const cx = areaSize.w / 2;
  const cy = areaSize.h / 2;

  return vec2(
    cx + getRandomNumber(-cx + border.x, cx - border.x),
    cy + getRandomNumber(-cy + border.y, cy - border.y),
  );
};

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
    if (vec2.dist(buffer[i], buffer[(i + 1) % buffer.length]) >= minDistance)
      i++;
    else
      buffer.splice(i, 1);
  }

  return buffer;
};

/**
 * Adds to road map random points moved in random directions
 *
 * @param {Object} config
 *
 * @returns {vec2[]}
 */
const addRandomCurves = ({every, curveSize}) => (points) => {
  console.log(every, curveSize);
  return points;
};

/**
 * Generate array of points from provided area size
 *
 * @param {Rect} area
 */
const generateRandomRoad = (area) => {
  const margin = 100;
  const points = R.compose(
    addRandomCurves(
      {
        every: 0.5,
        curveSize: [margin / 2, margin],
      },
    ),
    dropNearPoints(
      {
        minDistance: margin,
      },
    ),
    convexHull,
    generateAreaPoints(
      {
        x: margin,
        y: margin,
      },
      30,
    ),
  )(area);

  const interpolatedPoints = catmull(
    {
      step: 0.1,
    },
  )(points);

  return {
    points,
    interpolatedPoints,
  };
};

export default generateRandomRoad;
