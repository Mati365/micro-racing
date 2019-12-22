import React, {useEffect} from 'react';
import PropTypes from 'prop-types';

import {useHistory} from 'react-router-dom';
import {useI18n} from '@ui/i18n';

import {PLAYER_ACTIONS} from '@game/network/constants/serverCodes';

import {
  Flex,
  Margin,
} from '@ui/basic-components/styled';

import PlayerClientSocket from '../../../protocol/PlayerClientSocket';

import TitledScreen from '../TitledScreen';
import {GameInput, GameButton} from '../../components/ui';

import MapChooseColumn from './MapChooseColumn';
import RacingConfigColumn from './RacingConfigColumn';

const RoomEdit = ({client, gameBoard}) => { // eslint-disable-line no-unused-vars
  const t = useI18n('game.screens.room_edit');
  const history = useHistory();

  const onLeaveRoom = async () => {
    await client.leaveRoom();
    history.goBack();
  };

  useEffect(
    () => {
      const unmountListener = client.rpc.chainListener(
        PLAYER_ACTIONS.YOU_ARE_KICKED,
        onLeaveRoom,
      );

      return () => {
        gameBoard?.release();
        unmountListener();
      };
    },
    [client],
  );

  return (
    <TitledScreen
      header={(
        <Flex direction='row'>
          {t('header')}
          <Margin left={3}>
            <GameInput
              defaultValue={gameBoard.roomInfo.name}
              style={{
                width: 400,
              }}
            />
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
          <MapChooseColumn client={client} />
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
    </TitledScreen>
  );
};

RoomEdit.displayName = 'RoomEdit';

RoomEdit.propTypes = {
  client: PropTypes.instanceOf(PlayerClientSocket).isRequired,
  gameBoard: PropTypes.any.isRequired,
};

export default React.memo(RoomEdit);
