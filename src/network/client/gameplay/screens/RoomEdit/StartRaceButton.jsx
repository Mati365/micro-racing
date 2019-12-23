import React from 'react';

import {useI18n} from '@ui/i18n';
import {GameButton} from '../../components/ui';

const StartRaceButton = () => {
  const t = useI18n('game.screens.choose_config');

  return (
    <GameButton
      type='blue'
      expanded
    >
      {t('start_race')}
    </GameButton>
  );
};

StartRaceButton.displayName = 'StartRaceButton';

export default React.memo(StartRaceButton);
