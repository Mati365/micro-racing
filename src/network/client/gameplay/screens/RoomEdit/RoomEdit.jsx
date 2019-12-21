import React from 'react';
import PropTypes from 'prop-types';

import {useI18n} from '@ui/i18n';

import {
  Text,
  Margin,
} from '@ui/basic-components/styled';

import PlayerClientSocket from '../../../protocol/PlayerClientSocket';
import TitledScreen from '../TitledScreen';

const RoomEdit = ({client, room}) => { // eslint-disable-line no-unused-vars
  const t = useI18n('game.screens.room_edit');

  return (
    <TitledScreen
      header={(
        <>
          {t('header')}
          <Margin left={2}>
            <Text type='crimson_red'>
              {room.name}
            </Text>
          </Margin>
        </>
      )}
    >
      abc
    </TitledScreen>
  );
};

RoomEdit.displayName = 'RoomEdit';

RoomEdit.propTypes = {
  client: PropTypes.instanceOf(PlayerClientSocket).isRequired,
  room: PropTypes.any.isRequired,
};

export default React.memo(RoomEdit);
