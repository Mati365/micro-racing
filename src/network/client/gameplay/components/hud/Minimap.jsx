import React, {useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';

import {DIMENSIONS_SCHEMA} from '@ui/schemas';
import {
  BLACK,
  LIGHT_GRAY,
  CRIMSON_RED,
} from '@ui/colors';

import {injectClassesStylesheet} from '@pkg/fast-stylesheet/src/react';
import {Size, vec2} from '@pkg/gl-math';
import {drawPolygon, drawPoint} from '@pkg/ctx-utils';

import TrackSegments from '@game/logic/track/TrackSegments/TrackSegments';
import {Layer} from '@ui/basic-components/styled';

const prerenderMapThumbnail = (
  {
    padding = vec2(10, 10),
    color = LIGHT_GRAY,
    pointColor = CRIMSON_RED,
    lineWidth = 6,
    pointRadius = null,
    dimensions,
    roadSegment,
  },
) => (canvas) => {
  const {box} = roadSegment;
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
    roadSegment.path,
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
    projectPointFn,
  };
};

const renderPlayersOnMinimap = (
  {
    projectPointFn,
    dimensions,
    ctx,
  },
) => (players) => {
  ctx.clearRect(0, 0, dimensions.w, dimensions.h);

  for (const playerID in players) {
    const {body, player} = players[playerID];
    if (!body.pos)
      continue;

    drawPoint(
      player.racingState.color,
      4,
      projectPointFn(body.pos),
      ctx,
    );
  }
};

export const MapThumbnail = ({
  dimensions, roadsSegments, renderConfig, className,
  rootCanvasProps, playersCanvasProps, playersAccessorFn,
  children,
  ...props
}) => {
  const canvasRef = useRef();
  const playersCanvasRef = useRef();

  useEffect(
    () => {
      if (R.isEmpty(roadsSegments))
        throw new Error('No roads to render!');

      const {projectPointFn} = prerenderMapThumbnail(
        {
          ...renderConfig,
          dimensions,
          roadSegment: roadsSegments[0],
        },
      )(canvasRef.current);

      if (!playersAccessorFn)
        return undefined;

      // refresh players positons interval
      const renderPlayers = renderPlayersOnMinimap(
        {
          ctx: playersCanvasRef.current.getContext('2d'),
          dimensions,
          projectPointFn,
        },
      );

      const interval = setInterval(
        () => {
          renderPlayers(
            playersAccessorFn(),
          );
        },
        100,
      );

      return () => clearInterval(interval);
    },
    [playersAccessorFn],
  );

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        width={dimensions.w}
        height={dimensions.h}
        {...props}
        {...rootCanvasProps}
      />
      {playersAccessorFn && (
        <Layer
          tag='canvas'
          ref={playersCanvasRef}
          width={dimensions.w}
          height={dimensions.h}
          {...playersCanvasProps}
        />
      )}
      {children}
    </div>
  );
};

MapThumbnail.displayName = 'MapThumbnail';

MapThumbnail.propTypes = {
  rootCanvasProps: PropTypes.any,
  playersCanvasProps: PropTypes.any,
  renderConfig: PropTypes.any,
  playersAccessorFn: PropTypes.func,
  dimensions: DIMENSIONS_SCHEMA,
  roadsSegments: PropTypes.arrayOf(
    PropTypes.instanceOf(TrackSegments),
  ).isRequired,
};

MapThumbnail.defaultProps = {
  dimensions: new Size(120, 120),
  playersAccessorFn: null,
  renderConfig: {},
  playersCanvasProps: {},
  rootCanvasProps: {},
};

const HudMinimap = injectClassesStylesheet(
  {
    base: {
      position: 'absolute !important',
      left: 20,
      top: 20,

      '& canvas': {
        transform: 'rotate(-135deg)', // perspective fix due to isometric engine
      },
    },
  },
)(({classes, ...props}) => (
  <MapThumbnail
    {...props}
    className={classes.base}
    rootCanvasProps={{
      style: {
        opacity: 0.3,
      },
    }}
  />
));

export default React.memo(HudMinimap);
