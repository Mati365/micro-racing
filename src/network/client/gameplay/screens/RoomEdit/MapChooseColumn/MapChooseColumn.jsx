import React from 'react';

import {useI18n} from '@ui/i18n';
import {
  useLowLatencyObservable,
  usePromiseCallback,
} from '@pkg/basic-hooks';

import {Margin} from '@ui/basic-components/styled';
import {GameHeader} from '../../../components/ui';
import RoomMapsList from './RoomMapsList';
import EditableEditorCanvas from './EditableEditorCanvas';

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
        onSaveMap={onRequestMap}
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
