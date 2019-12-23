import React, {useState} from 'react';

import {useI18n} from '@ui/i18n';

import {IdleRender} from '@ui/basic-components';
import {Margin} from '@ui/basic-components/styled';

import {LoadingOverlay} from '../../components/parts';
import {
  GameCard,
  GameHeader,
  GameButton,
} from '../../components/ui';

import RoomMapsList from './RoomMapsList';
import TrackEditorCanvas from './TrackEditorCanvas';

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
        <IdleRender loadingComponent={LoadingOverlay}>
          {() => (
            <TrackEditorCanvas
              canvasConfig={{
                scale: 0.5,
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
