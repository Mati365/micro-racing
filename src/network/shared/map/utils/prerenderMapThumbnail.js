import * as R from 'ramda';

import {
  BLACK,
  LIGHT_GRAY,
  CRIMSON_RED,
} from '@ui/colors';

import {Size, vec2} from '@pkg/gl-math';
import {drawPolygon, drawPoint} from '@pkg/ctx-utils';

const prerenderMapThumbnail = (
  {
    padding = vec2(10, 10),
    color = LIGHT_GRAY,
    pointColor = CRIMSON_RED,
    lineWidth = 6,
    pointRadius = null,
    dimensions,
    roadSegment: {
      box,
      path,
    },
  } = {},
) => (canvas) => {
  if (!dimensions)
    dimensions = new Size(canvas.width, canvas.height);

  const {w, h} = box;

  const ctx = canvas.getContext('2d');
  const projectPointFn = ([x, y]) => vec2(
    (x - box.x) / w * (dimensions.w - padding.x * 2) + padding.x,
    (y - box.y) / h * (dimensions.h - padding.y * 2) + padding.y,
  );

  const scaledPath = R.transduce(
    R.map(projectPointFn),
    R.flip(R.append),
    [],
    path,
  );

  ctx.clearRect(0, 0, dimensions.w, dimensions.h);
  drawPolygon(scaledPath, color, lineWidth, true, ctx);

  if (pointRadius) {
    R.addIndex(R.forEach)(
      (point, index) => {
        if (index % 8)
          return;

        ctx.beginPath();
        drawPoint(pointColor, pointRadius, point, ctx);
        ctx.lineWidth = 1;
        ctx.strokeStyle = BLACK;
        ctx.stroke();
      },
      scaledPath,
    );
  }

  return {
    canvas,
    projectPointFn,
  };
};

export const renderPlayersOnMinimap = (
  {
    projectPointFn,
    dimensions,
    ctx,
  },
) => (players) => {
  ctx.clearRect(0, 0, dimensions.w, dimensions.h);

  for (const playerID in players) {
    const {body, player} = players[playerID];
    if (!body?.pos)
      continue;

    drawPoint(
      player.racingState.color,
      4,
      projectPointFn(body.pos),
      ctx,
    );
  }
};

export default prerenderMapThumbnail;
