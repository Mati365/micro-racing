import * as R from 'ramda';

import {vec2} from '@pkg/gl-math/matrix';
import convexHull from './convexHull';

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
 * @param {Point} border
 *
 * @returns {Array}
 */
export const generateAreaPoints = R.curry(
  (border, area) => {
    const points = R.times(
      R.partial(getRandomPoint, [border, area]),
      20,
    );

    return points;
  },
);

/**
 * Renders array of points
 *
 * @param {String} color
 * @param {CanvasRenderingContext2D} ctx
 */
const renderPoints = (color, withText, ctx) => R.addIndex(R.forEach)(
  ({x, y}, index) => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    if (withText) {
      ctx.font = '10px Georgia';
      ctx.fillText(index, x - 2, y - 10);
    }
  },
);

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
    convexHull,
    generateAreaPoints(
      {
        x: 40,
        y: 40,
      },
    ),
  )(area);

  const ctx = ref.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, area.w, area.h);

  renderPoints('#FF0000', true, ctx)(points);
};

export default attachRoadmapGenerator;
