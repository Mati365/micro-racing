import React, {useRef, useEffect} from 'react';

import {DIMENSIONS_SCHEMA} from '@pkg/basic-type-schemas';
import {useGameBoard} from './GameBoard';

import EditorCanvas from '../EditorCanvas';
import TrackPath from '../types/TrackPath';

const track = TrackPath.fromRandomPath(
  {
    w: 640,
    h: 480,
  },
);

const GameCanvas = ({dimensions}) => {
  const canvasRef = useRef();
  const game = useGameBoard();

  useEffect(
    () => {
      game
        .setCanvas(
          {
            canvas: canvasRef.current,
            aspectRatio: 1.16,
            dimensions,
            track,
          },
        );
    },
    [],
  );

  return (
    <div>
      <canvas
        tabIndex={-1}
        ref={canvasRef}
        width={dimensions.w}
        height={dimensions.h}
      />

      <EditorCanvas
        dimensions={dimensions}
        track={track}
      />
    </div>
  );
};

GameCanvas.displayName = 'GameCanvas';

GameCanvas.propTypes = {
  dimensions: DIMENSIONS_SCHEMA,
};

GameCanvas.defaultProps = {
  dimensions: {
    w: 640,
    h: 550,
  },
};

export default GameCanvas;
