import React from 'react';

import {useI18n} from '@ui/i18n';

import {Margin} from '@ui/basic-components/styled';
import TrackEditorCanvas from './TrackEditorCanvas';
import {
  GameCard,
  GameHeader,
} from '../../components/ui';

import RoomMapsList from './RoomMapsList';

const MapChooseColumn = ({client}) => {
  const t = useI18n('game.screens.room_edit');

  return (
    <>
      <GameCard
        style={{
          paddingBottom: '75%',
        }}
      >
        <TrackEditorCanvas
          canvasConfig={{
            scale: 0.5,
          }}
        />
      </GameCard>

      <Margin top={4}>
        <GameHeader>
          {t('predefined_maps')}
        </GameHeader>

        <RoomMapsList client={client} />
      </Margin>
    </>
  );
};

MapChooseColumn.displayName = 'MapChooseColumn';

export default MapChooseColumn;
