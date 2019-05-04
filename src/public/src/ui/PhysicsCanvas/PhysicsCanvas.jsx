import React, {useEffect, useRef} from 'react';
import {usePhysicsBoard} from './PhysicsBoard';

const PhysicsCanvas = ({dimensions}) => {
  const canvasRef = useRef();
  const editor = usePhysicsBoard();

  useEffect(
    () => {
      editor
        .setCanvas(
          {
            canvas: canvasRef.current,
            dimensions,
          },
        )
        .run();
    },
    [],
  );

  return (
    <canvas
      ref={canvasRef}
      tabIndex={-1}
      width={dimensions.w}
      height={dimensions.h}
      style={{
        outline: 0,
      }}
    />
  );
};

PhysicsCanvas.displayName = 'PhysicsCanvas';

export default PhysicsCanvas;
