import React from 'react';

import {useI18n} from '@ui/i18n';
import {GameTabs} from '../../components/ui';

const RacingConfigColumn = () => {
  const t = useI18n('game.screens.room_edit');

  return (
    <>
      <GameTabs>
        <GameTabs.Tab
          id='settings'
          title={t('tabs.settings')}
        >
          {() => (
            <div>
              COŚ
            </div>
          )}
        </GameTabs.Tab>

        <GameTabs.Tab
          id='players'
          title={t('tabs.players')}
        >
          {() => (
            <div>
              COŚ
            </div>
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
