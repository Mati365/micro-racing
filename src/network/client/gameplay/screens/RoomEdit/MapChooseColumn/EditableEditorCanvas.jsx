import React, {useRef, useState} from 'react';

import {useI18n} from '@ui/i18n';
import {useUpdateEffect} from '@pkg/basic-hooks';

import {
  AsyncLockButton,
  IdleRender,
} from '@ui/basic-components';

import {LoadingOverlay} from '../../../components/parts';
import {
  GameCard,
  GameButton,
  GameButtonsList,
  GameLayerPortal,
} from '../../../components/ui';

import TrackEditorCanvas from './TrackEditorCanvas';
import * as Layers from './TrackEditorCanvas/Layers';

const EditorToolbar = ({disabled, children, t, editing, setEditing, onSaveMap}) => (
  <GameButtonsList
    style={{
      marginBottom: 10,
    }}
  >
    {(
      editing
        ? (
          <AsyncLockButton
            component={GameButton}
            disabled={disabled}
            type='green'
            onClick={
              async () => {
                await onSaveMap();
                setEditing(false);
              }
            }
          >
            {t('save_road')}
          </AsyncLockButton>
        )
        : (
          <GameButton
            type='green'
            disabled={disabled}
            onClick={() => setEditing(true)}
          >
            {t('edit_road')}
          </GameButton>
        )
    )}
    {children}
  </GameButtonsList>
);

const EditableEditorCanvas = React.memo(({
  disabled, roadMapElement, reloading, onSaveMap, ...props
}) => {
  const t = useI18n('game.screens.room_edit');

  const [editing, setEditing] = useState(false);
  const editorRef = useRef();
  const editorProps = {
    t,
    editing,
    setEditing,
  };

  const onSaveEditorMap = () => {
    const {current: editor} = editorRef;

    return onSaveMap(
      {
        points: editor.layers.track.track.getRealPathPoints(),
      },
    );
  };

  useUpdateEffect(
    () => {
      const {current: editor} = editorRef;
      if (reloading || !editor)
        return;

      editor.layers.track.fromBSON(
        [
          roadMapElement,
        ],
      );
    },
    [reloading, roadMapElement],
  );

  const editorContent = (
    <IdleRender
      pause={
        !roadMapElement || reloading
      }
      loadingComponent={LoadingOverlay}
    >
      {() => (
        <TrackEditorCanvas
          ref={editorRef}
          layers={{
            track: new Layers.TrackLayer(
              {
                scale: editing ? 0.8 : 0.5,
                roadMapElement,
              },
            ),
          }}
          disabled={
            disabled || !editing
          }
          {...props}
        />
      )}
    </IdleRender>
  );

  return (
    <div>
      <EditorToolbar
        {...editorProps}
        disabled={disabled}
      />
      <GameCard
        style={{
          paddingBottom: '75%',
        }}
      >
        {(
          editing
            ? (
              <GameLayerPortal black>
                <EditorToolbar
                  {...editorProps}
                  disabled={disabled}
                  onSaveMap={onSaveEditorMap}
                >
                  <GameButton
                    type='red'
                    onClick={
                      () => setEditing(false)
                    }
                  >
                    {t('discard_road')}
                  </GameButton>
                </EditorToolbar>

                <GameCard
                  style={{
                    width: '100%',
                    height: 'auto',
                    flexGrow: 1,
                  }}
                >
                  {editorContent}
                </GameCard>
              </GameLayerPortal>
            )
            : editorContent
        )}
      </GameCard>
    </div>
  );
});

EditableEditorCanvas.displayName = 'EditableEditorCanvas';

export default EditableEditorCanvas;
