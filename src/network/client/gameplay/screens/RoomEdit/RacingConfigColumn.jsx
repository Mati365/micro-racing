import React from 'react';

import {useI18n} from '@ui/i18n';

import PlayersListConfig from './PlayersListConfig';
import RaceConfig from './RaceConfig';
import {
  GameDivider,
  GameTabs,
} from '../../components/ui';

const RacingConfigColumn = ({gameBoard}) => {
  const t = useI18n('game.screens.room_edit');

  return (
    <>
      <GameTabs>
        <GameTabs.Tab
          id='players'
          title={t('tabs.players')}
        >
          {() => (
            <PlayersListConfig gameBoard={gameBoard} />
          )}
        </GameTabs.Tab>
      </GameTabs>

      <GameDivider />

      <GameTabs>
        <GameTabs.Tab
          id='settings'
          title={t('tabs.settings')}
        >
          {() => (
            <RaceConfig />
          )}
        </GameTabs.Tab>

        <GameTabs.Tab
          id='chat'
          title={t('tabs.chat')}
        >
          {() => (
            <div>
              COŚ
            </div>
          )}
        </GameTabs.Tab>
      </GameTabs>
    </>
  );
};

RacingConfigColumn.displayName = 'RacingConfigColumn';

export default React.memo(RacingConfigColumn);
