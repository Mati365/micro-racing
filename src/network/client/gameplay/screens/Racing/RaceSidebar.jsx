import React from 'react';

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

const RaceSidebar = ({gameBoard}) => {
  const t = useI18n('game.screens');
  const {onLeaveRacing} = useScreensWatcher(
    {
      currentScreen: RACE_STATES.RACE,
      gameBoard,
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
