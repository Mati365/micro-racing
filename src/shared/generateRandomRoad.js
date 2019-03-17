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
export const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const getRandomAngle = () => Math.random() * 2 * Math.PI;

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
    const nextIndex = (i + 1) % buffer.length;
    if (vec2.dist(buffer[i], buffer[nextIndex]) >= minDistance)
      i++;
    else
      buffer.splice(nextIndex, 1);
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
  const buffer = [];

  for (let i = 0; i < points.length; ++i) {
    const [current, next] = [points[i], points[(i + 1) % points.length]];
    buffer.push(current);

    for (let j = every; j < 1.0; j += every) {
      const mid = vec2.lerp(j, current, next);
      const offset = vec2.mul(
        getRandomNumber(
          curveSize[0],
          curveSize[1],
        ),
        vec2.normalize(
          vec2.orthogonal(
            vec2.sub(current, next),
          ),
        ),
      );

      const point = vec2.add(mid, offset);
      point.added = true;
      buffer.push(point);
    }
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
    addRandomCurves(
      {
        every: 0.5,
        curveSize: [-100, 100],
      },
    ),
    dropNearPoints(
      {
        minDistance: 100,
      },
    ),
    convexHull,
    generateAreaPoints(
      {
        x: 100,
        y: 100,
      },
      20,
    ),
  )(area);

  const interpolatedPoints = catmull(
    {
      step: 0.2,
    },
  )(points);

  return {
    points,
    interpolatedPoints,
  };
};

export default generateRandomRoad;
