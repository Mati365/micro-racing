import React, {
  useRef,
  useEffect,
  useMemo,
} from 'react';

import {DIMENSIONS_SCHEMA} from '@ui/schemas';

import {Wrapper} from '@ui/basic-components/styled';
import TrackEditor from './TrackEditor';
import Toolbar from './Toolbar/Toolbar';

const useTrackEditor = initialConfig => useMemo(
  () => new TrackEditor(initialConfig),
  [],
);

/**
 * Render editor stuff
 *
 * @export
 */
const EditorCanvas = ({dimensions}) => {
  const roadRef = useRef();
  const editor = useTrackEditor();

  useEffect(
    () => {
      editor.setCanvas(
        {
          canvas: roadRef.current,
        },
      );
    },
    [],
  );

  return (
    <Wrapper position='relative'>
      <canvas
        ref={roadRef}
        tabIndex={-1}
        width={dimensions.w}
        height={dimensions.h}
        style={{
          outline: 0,
        }}
      />

      <Toolbar editor={editor} />
    </Wrapper>
  );
};

EditorCanvas.displayName = 'EditorCanvas';

EditorCanvas.propTypes = {
  dimensions: DIMENSIONS_SCHEMA.isRequired,
};

export default EditorCanvas;
