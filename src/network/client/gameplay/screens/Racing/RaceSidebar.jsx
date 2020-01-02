import React from 'react';
import * as R from 'ramda';

import {RACE_STATES} from '@game/network/constants/serverCodes';

import {useI18n} from '@ui/i18n';

import {Flex} from '@ui/basic-components/styled';
import {AsyncLockButton} from '@ui/basic-components';

import RaceChat from '../RoomEdit/RaceChat';
import {
  GameButton,
  GameTabs,
} from '../../components/ui';

import useScreensWatcher from '../../hooks/useScreensWatcher';
import useIsClientBoardOP from '../../hooks/useIsClientBoardOP';

const RaceSidebar = ({gameBoard}) => {
  const t = useI18n('game.screens');
  const currentOp = useIsClientBoardOP(gameBoard);
  const {
    onStopRacing,
    onLeaveRacing,
  } = useScreensWatcher(
    {
      currentScreen: RACE_STATES.RACE,
      gameBoard,
    },
  );

  const loading = R.isNil(gameBoard.roomInfo.ownerID);

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
        disabled={loading}
        component={GameButton}
        type='red'
        style={{
          marginTop: 10,
        }}
        expanded
        onClick={(
          currentOp
            ? onStopRacing
            : onLeaveRacing
        )}
      >
        {(
          loading
            ? t('game.shared.loading')
            : t(`racing.${currentOp ? 'stop_racing' : 'leave_room'}`)
        )}
      </AsyncLockButton>
    </Flex>
  );
};

RaceSidebar.displayName = 'RaceSidebar';

export default React.memo(RaceSidebar);
