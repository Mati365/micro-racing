import React from 'react';
import PropTypes from 'prop-types';

import {RACE_STATES} from '@game/network/constants/serverCodes';

import {useI18n} from '@ui/i18n';
import {
  Flex,
  Margin,
} from '@ui/basic-components/styled';

import PlayerClientSocket from '../../../protocol/PlayerClientSocket';
import TitledScreen from '../TitledScreen';
import {GameButton} from '../../components/ui';
import {GamePortalHolder} from '../../components/ui/GameLayerPortal';

import MapChooseColumn from './MapChooseColumn';
import RacingConfigColumn from './RacingConfigColumn';
import EditRoomNameForm from './EditRoomNameForm';
import useScreensWatcher from '../../hooks/useScreensWatcher';

const RoomEdit = ({client, gameBoard}) => { // eslint-disable-line no-unused-vars
  const t = useI18n('game.screens.room_edit');
  const {onLeaveRoom} = useScreensWatcher(
    {
      currentScreen: RACE_STATES.BOARD_VIEW,
      gameBoard,
    },
  );

  return (
    <TitledScreen
      header={(
        <Flex direction='row'>
          {t('header')}
          <Margin left={3}>
            <EditRoomNameForm gameBoard={gameBoard} />
          </Margin>

          <Margin left='auto'>
            <GameButton
              type='red'
              onClick={onLeaveRoom}
            >
              {t('leave')}
            </GameButton>
          </Margin>
        </Flex>
      )}
    >
      <Flex direction='row'>
        <div style={{width: '70%'}}>
          <MapChooseColumn gameBoard={gameBoard} />
        </div>

        <div
          style={{
            width: '30%',
            paddingLeft: 20,
          }}
        >
          <RacingConfigColumn gameBoard={gameBoard} />
        </div>
      </Flex>

      <GamePortalHolder />
    </TitledScreen>
  );
};

RoomEdit.displayName = 'RoomEdit';

RoomEdit.propTypes = {
  client: PropTypes.instanceOf(PlayerClientSocket).isRequired,
  gameBoard: PropTypes.any.isRequired,
};

export default React.memo(RoomEdit);
