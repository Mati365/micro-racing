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
import {ChatTabs} from '../RacingConfigColumn';

import useIsClientBoardOP from '../../../hooks/useIsClientBoardOP';

const MapChooseColumn = ({gameBoard}) => {
  const {client} = gameBoard;

  const t = useI18n('game.screens.room_edit');
  const op = useIsClientBoardOP(gameBoard);

  const roadMapElement = useLowLatencyObservable(
    {
      observable: gameBoard.observers.roomMap,
    },
  )?.refsStore?.roadElement[0];

  const [onRequestMap, {loading}] = usePromiseCallback(
    ::client.loadMap,
  );

  let footerContent = null;
  if (op !== null) {
    footerContent = (
      op
        ? (
          <>
            <GameHeader>
              {t('predefined_maps')}
            </GameHeader>

            <RoomMapsList
              gameBoard={gameBoard}
              onRequestMap={onRequestMap}
            />
          </>
        )
        : <ChatTabs gameBoard={gameBoard} />
    );
  }

  return (
    <>
      <EditableEditorCanvas
        disabled={!op}
        reloading={loading}
        roadMapElement={roadMapElement}
        onSaveMap={onRequestMap}
      />

      <Margin
        top={4}
        block
      >
        {footerContent}
      </Margin>
    </>
  );
};

MapChooseColumn.displayName = 'MapChooseColumn';

export default React.memo(MapChooseColumn);
