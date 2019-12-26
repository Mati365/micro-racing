import React, {useRef, useState} from 'react';

import {useI18n} from '@ui/i18n';
import {
  useUpdateEffect,
  useLowLatencyObservable,
  usePromiseCallback,
} from '@pkg/basic-hooks';

import {IdleRender} from '@ui/basic-components';
import {Margin} from '@ui/basic-components/styled';

import {LoadingOverlay} from '../../../components/parts';
import {
  GameCard,
  GameHeader,
  GameButton,
} from '../../../components/ui';

import RoomMapsList from './RoomMapsList';
import TrackEditorCanvas from './TrackEditorCanvas';
import * as Layers from './TrackEditorCanvas/Layers';

const EditableEditorCanvas = React.memo(({roadMapElement, reloading, ...props}) => {
  const [editing] = useState(false);
  const editorRef = useRef();
  const t = useI18n('game.screens.room_edit');

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

  return (
    <div>
      <Margin
        bottom={3}
        block
      >
        <GameButton type='green'>
          {t('edit_road')}
        </GameButton>
      </Margin>

      <GameCard
        style={{
          paddingBottom: '75%',
        }}
      >
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
                    scale: 0.5,
                    roadMapElement,
                  },
                ),
              }}
              disabled={!editing}
              {...props}
            />
          )}
        </IdleRender>
      </GameCard>
    </div>
  );
});

const MapChooseColumn = ({gameBoard}) => {
  const {client} = gameBoard;
  const t = useI18n('game.screens.room_edit');

  const roadMapElement = useLowLatencyObservable(
    {
      observable: gameBoard.observers.roomMap,
    },
  )?.map?.roadElement[0];


  const [onRequestMap, {loading}] = usePromiseCallback(
    ::client.loadMap,
  );

  return (
    <>
      <EditableEditorCanvas
        reloading={loading}
        roadMapElement={roadMapElement}
      />

      <Margin top={4}>
        <GameHeader>
          {t('predefined_maps')}
        </GameHeader>

        <RoomMapsList
          gameBoard={gameBoard}
          onRequestMap={onRequestMap}
        />
      </Margin>
    </>
  );
};

MapChooseColumn.displayName = 'MapChooseColumn';

export default React.memo(MapChooseColumn);
