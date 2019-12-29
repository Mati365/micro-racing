import React from 'react';

import {useI18n} from '@ui/i18n';

import PlayersListConfig from './PlayersListConfig';
import RaceConfig from './RaceConfig';
import StartRaceButton from './StartRaceButton';
import KickedPlayersConfig from './KickedPlayersConfig';
import RaceChat from './RaceChat';
import {
  GameDivider,
  GameTabs,
} from '../../components/ui';

import useIsClientBoardOP from '../../hooks/useIsClientBoardOP';

export const ChatTabs = React.memo(({gameBoard}) => {
  const t = useI18n('game.screens.room_edit');

  return (
    <GameTabs>
      <GameTabs.Tab
        id='chat'
        title={t('tabs.chat')}
        padding='small'
      >
        {() => (
          <RaceChat
            gameBoard={gameBoard}
            style={{
              height: 220,
            }}
          />
        )}
      </GameTabs.Tab>
    </GameTabs>
  );
});

const RacingConfigColumn = ({gameBoard, onBeforeStart}) => {
  const t = useI18n('game.screens.room_edit');
  const op = useIsClientBoardOP(gameBoard);

  return (
    <>
      <GameTabs>
        <GameTabs.Tab
          id='settings'
          title={t('tabs.settings')}
        >
          {() => (
            <RaceConfig
              gameBoard={gameBoard}
              op={op}
            />
          )}
        </GameTabs.Tab>
      </GameTabs>

      <GameDivider />

      <GameTabs>
        <GameTabs.Tab
          id='players'
          title={t('tabs.players')}
        >
          {() => (
            <PlayersListConfig gameBoard={gameBoard} />
          )}
        </GameTabs.Tab>

        <GameTabs.Tab
          id='banned'
          title={t('tabs.banned')}
        >
          {() => (
            <KickedPlayersConfig gameBoard={gameBoard} />
          )}
        </GameTabs.Tab>
      </GameTabs>

      {op && (
        <>
          <GameDivider />

          <ChatTabs gameBoard={gameBoard} />

          <GameDivider />

          <StartRaceButton
            gameBoard={gameBoard}
            onClick={onBeforeStart}
          />
        </>
      )}
    </>
  );
};

RacingConfigColumn.displayName = 'RacingConfigColumn';

export default React.memo(RacingConfigColumn);
