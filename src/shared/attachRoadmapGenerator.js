import * as R from 'ramda';

import {vec2} from '@pkg/gl-math/matrix';
import convexHull from '@pkg/convex-hull';

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
 * Renders array of points
 *
 * @param {String} color
 * @param {Boolean} withIndices
 * @param {CanvasRenderingContext2D} ctx
 *
 * @param {vec2[]} points
 */
const renderPoints = (color, withIndices, ctx) => R.addIndex(R.forEach)(
  ({x, y}, index) => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    if (withIndices) {
      ctx.font = '10px Georgia';
      ctx.fillText(index, x - 2, y - 10);
    }
  },
);

/**
 * @param {String} color
 * @param {Number} width
 * @param {CanvasRenderingContext2D} ctx
 *
 * @param {vec2[]} points
 */
const renderLoopedLines = (color, width, ctx) => (points) => {
  const origin = points[0];

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;

  ctx.moveTo(origin.x, origin.y);

  for (let i = 1; i < points.length; i++) {
    const {x, y} = points[i];
    ctx.lineTo(x, y);
  }

  ctx.lineTo(origin.x, origin.y);
  ctx.stroke();
};

/**
 * Makes lines more curvy
 *
 * @param {Object} config
 *
 * @param {vec2[]} points
 */
const catmull = ({step}) => (points) => {
  console.log(step);
  return points;
};

/**
 * Renders map to canvas
 *
 * @see
 *  http://www.gamasutra.com/blogs/GustavoMaciel/20131229/207833/Generating_Procedural_Racetracks.php
 *
 * @param {Size} area
 * @param {HTMLElement} ref
 */
const attachRoadmapGenerator = (area, ref) => {
  const points = R.compose(
    catmull(
      {
        step: 0.1,
      },
    ),
    convexHull,
    generateAreaPoints(
      {
        x: 40,
        y: 40,
      },
      30,
    ),
  )(area);

  const ctx = ref.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, area.w, area.h);

  renderLoopedLines('#FFFFFF', 2, ctx)(points);
  renderPoints('#FF0000', true, ctx)(points);
};

export default attachRoadmapGenerator;
