import React, {useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';

import {DIMENSIONS_SCHEMA} from '@ui/schemas';

import {injectClassesStylesheet} from '@pkg/fast-stylesheet/src/react';
import prerenderMapThumbnail, {renderPlayersOnMinimap} from '@game/shared/map/utils/prerenderMapThumbnail';

import {Size} from '@pkg/gl-math';
import {Layer} from '@ui/basic-components/styled';
import TrackSegments from '@game/logic/track/TrackSegments/TrackSegments';

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
