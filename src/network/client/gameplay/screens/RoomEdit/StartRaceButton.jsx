import React from 'react';

import {useI18n} from '@ui/i18n';

import {AsyncLockButton} from '@ui/basic-components';
import {GameButton} from '../../components/ui';

const StartRaceButton = ({gameBoard}) => {
  const t = useI18n('game.screens.choose_config');

  const onStartRace = () => gameBoard.client.startRace();

  return (
    <AsyncLockButton
      component={GameButton}
      type='blue'
      expanded
      onClick={onStartRace}
    >
      {t('start_race')}
    </AsyncLockButton>
  );
};

StartRaceButton.displayName = 'StartRaceButton';

export default React.memo(StartRaceButton);
