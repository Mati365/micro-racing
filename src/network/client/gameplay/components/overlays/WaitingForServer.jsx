import React from 'react';

import {useI18n} from '@ui/i18n';
import TitledOverlay from '../parts/TitledOverlay';

const WaitingForServer = () => {
  const t = useI18n();

  return (
    <TitledOverlay>
      {t('game.racing.waiting_for_server')}
    </TitledOverlay>
  );
};

WaitingForServer.displayName = 'WaitingForServer';

export default React.memo(WaitingForServer);
