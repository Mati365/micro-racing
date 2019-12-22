import React, {
  useRef,
  useEffect,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';

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
const TrackEditorCanvas = ({dimensions, canvasConfig}) => {
  const roadRef = useRef();
  const editor = useTrackEditor();

  useEffect(
    () => {
      editor.setCanvas(
        {
          canvas: roadRef.current,
          ...canvasConfig,
        },
      );
    },
    [],
  );

  return (
    <Wrapper expanded>
      <canvas
        ref={roadRef}
        tabIndex={-1}
        style={{
          outline: 0,
          width: dimensions?.w || '100%',
          height: dimensions?.h || 'calc(100% - 40px)',
        }}
      />

      <Toolbar editor={editor} />
    </Wrapper>
  );
};

TrackEditorCanvas.displayName = 'TrackEditorCanvas';

TrackEditorCanvas.propTypes = {
  dimensions: DIMENSIONS_SCHEMA,
  canvasConfig: PropTypes.any,
};

TrackEditorCanvas.defaultProps = {
  dimensions: null,
  canvasConfig: null,
};

export default React.memo(TrackEditorCanvas);
