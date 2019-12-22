import React, {useState} from 'react';

import {useI18n} from '@ui/i18n';

import {Margin} from '@ui/basic-components/styled';
import TrackEditorCanvas from './TrackEditorCanvas';
import {
  GameCard,
  GameHeader,
  GameButton,
} from '../../components/ui';

import RoomMapsList from './RoomMapsList';

const EditableEditorCanvas = React.memo((props) => {
  const [editing] = useState(false);
  const t = useI18n('game.screens.room_edit');

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
        <TrackEditorCanvas
          canvasConfig={{
            scale: 0.5,
          }}
          disabled={!editing}
          {...props}
        />
      </GameCard>
    </div>
  );
});

const MapChooseColumn = ({client}) => {
  const t = useI18n('game.screens.room_edit');

  return (
    <>

      <EditableEditorCanvas />

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
