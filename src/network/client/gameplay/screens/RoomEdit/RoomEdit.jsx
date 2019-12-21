import React from 'react';
import PropTypes from 'prop-types';

import {useI18n} from '@ui/i18n';

import {
  Flex,
  Margin,
} from '@ui/basic-components/styled';

import PlayerClientSocket from '../../../protocol/PlayerClientSocket';
import TitledScreen from '../TitledScreen';
import TrackEditorCanvas from './TrackEditorCanvas';
import {
  GameInput,
  GameCard,
} from '../../components/ui';

const RoomEdit = ({client, room}) => { // eslint-disable-line no-unused-vars
  const t = useI18n('game.screens.room_edit');

  return (
    <TitledScreen
      header={(
        <Flex direction='row'>
          {t('header')}
          <Margin left={3}>
            <GameInput
              value={room.name}
              style={{
                width: 400,
              }}
            />
          </Margin>
        </Flex>
      )}
    >
      <GameCard
        style={{
          paddingBottom: '75%',
        }}
      >
        <TrackEditorCanvas />
      </GameCard>
    </TitledScreen>
  );
};

RoomEdit.displayName = 'RoomEdit';

RoomEdit.propTypes = {
  client: PropTypes.instanceOf(PlayerClientSocket).isRequired,
  room: PropTypes.any.isRequired,
};

export default React.memo(RoomEdit);
