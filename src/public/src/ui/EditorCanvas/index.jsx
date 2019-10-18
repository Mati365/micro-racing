import React, {
  useRef,
  useEffect,
  useMemo,
} from 'react';

import {DIMENSIONS_SCHEMA} from '@ui/schemas';
import TrackEditor from './TrackEditor';

const useTrackEditor = initialConfig => useMemo(
  () => new TrackEditor(initialConfig),
  [],
);

/**
 * Render editor stuff
 *
 * @export
 */
const EditorCanvas = ({track, dimensions}) => {
  const roadRef = useRef();
  const editor = useTrackEditor(
    {
      track,
    },
  );

  useEffect(
    () => {
      editor.setCanvas(
        {
          canvas: roadRef.current,
          dimensions,
        },
      );
    },
    [],
  );

  return (
    <canvas
      ref={roadRef}
      tabIndex={-1}
      width={dimensions.w}
      height={dimensions.h}
      style={{
        outline: 0,
      }}
    />
  );
};

EditorCanvas.displayName = 'EditorCanvas';

EditorCanvas.propTypes = {
  dimensions: DIMENSIONS_SCHEMA.isRequired,
};

export default EditorCanvas;
