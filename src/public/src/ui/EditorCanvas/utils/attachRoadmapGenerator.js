import * as R from 'ramda';

// import {vec2} from '@pkg/gl-math/matrix';
import expandPath from './expandPath';
// import deCasteljau from './deCasteljau';
// import generateRandomRoad from './generateRandomRoad';

/**
 * Renders array of points
 *
 * @param {String} color
 * @param {Boolean} withIndices
 * @param {CanvasRenderingContext2D} ctx
 *
 * @param {vec2[]} points
 */
export const renderPoints = (color, withIndices, ctx) => R.addIndex(R.forEach)(
  ({x, y, added}, index) => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = added ? '#0000ff' : color;
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
export const renderLines = (color, width, loop, ctx) => (points) => {
  const origin = points[0];

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;

  ctx.moveTo(origin.x, origin.y);

  for (let i = 1; i < points.length; i++) {
    const {x, y} = points[i];
    ctx.lineTo(x, y);
  }

  if (loop)
    ctx.lineTo(origin.x, origin.y);

  ctx.stroke();
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
const attachRoadmapGenerator = (area, ref, points = []) => {
  const ctx = ref.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, area.w, area.h);

  if (R.isEmpty(points))
    return;

  renderLines('#333333', 2, false, ctx)(points);
  renderPoints('#FF0000', false, ctx)(points);

  if (points.length > 2) {
    const [leftPoints, rightPoints] = expandPath(20, points);

    renderPoints('#00FF00', false, ctx)(leftPoints);
    renderPoints('#00FF00', false, ctx)(rightPoints);

    renderLines('#ffffff', 2, false, ctx)(leftPoints);
    renderLines('#ffffff', 2, false, ctx)(rightPoints);
  }
};

export default attachRoadmapGenerator;
