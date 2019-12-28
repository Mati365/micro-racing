import React from 'react';

import {useI18n} from '@ui/i18n';

import {GameTabs} from '../../components/ui';
import RaceChat from '../RoomEdit/RaceChat';

const ChatSidebar = ({gameBoard}) => {
  const t = useI18n();

  return (
    <GameTabs
      style={{
        paddingLeft: 20,
      }}
    >
      <GameTabs.Tab
        id='chat'
        title={
          t('game.screens.room_edit.tabs.chat')
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
  );
};

ChatSidebar.displayName = 'ChatSidebar';

export default React.memo(ChatSidebar);
