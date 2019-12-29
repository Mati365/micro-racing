import React from 'react';
import {useHistory} from 'react-router-dom';

import {RACE_STATES} from '@game/network/constants/serverCodes';

import {useI18n} from '@ui/i18n';
import {useLowLatencyObservable} from '@pkg/basic-hooks';

import {Flex} from '@ui/basic-components/styled';
import {AsyncLockButton} from '@ui/basic-components';

import RaceChat from '../RoomEdit/RaceChat';
import GameBoard from '../../states/GameBoard';
import {
  GameButton,
  GameTabs,
} from '../../components/ui';

const RaceSidebar = ({gameBoard}) => {
  const history = useHistory();
  const t = useI18n('game.screens');

  const onLeaveRacing = async () => {
    const {client} = gameBoard;
    const offscreenGameBoard = new GameBoard(
      {
        client,
      },
    );

    await offscreenGameBoard.loadInitialRoomState(
      await client.getRoomInitialState(),
    );

    history.push(
      '/config/room-edit',
      {
        gameBoard: offscreenGameBoard,
      },
    );
  };

  useLowLatencyObservable(
    {
      observable: gameBoard.observers.roomInfo,
      watchOnly: true,
      onChange: (info) => {
        if (!info)
          return;

        if (info.state?.type === RACE_STATES.ALL_FINISH
            || info.state?.type === RACE_STATES.BOARD_VIEW)
          onLeaveRacing();
      },
    },
  );

  return (
    <Flex
      direction='column'
      style={{
        paddingLeft: 20,
      }}
    >
      <GameTabs
        style={{
          flex: 1,
        }}
      >
        <GameTabs.Tab
          id='chat'
          title={
            t('room_edit.tabs.chat')
          }
          padding='small'
        >
          {() => (
            <RaceChat
              gameBoard={gameBoard}
              style={{
                flex: 1,
                minWidth: 250,
                height: '100%',
              }}
            />
          )}
        </GameTabs.Tab>
      </GameTabs>

      <AsyncLockButton
        component={GameButton}
        type='red'
        style={{
          marginTop: 10,
        }}
        expanded
        onClick={onLeaveRacing}
      >
        {t('racing.leave_racing')}
      </AsyncLockButton>
    </Flex>
  );
};

RaceSidebar.displayName = 'RaceSidebar';

export default React.memo(RaceSidebar);
