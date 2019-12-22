import React from 'react';

import {useI18n} from '@ui/i18n';
import {OverlayTitle} from '../components/parts/TitledOverlay';

const ConnectingScreen = () => {
  const t = useI18n();

  return (
    <OverlayTitle>
      {t('game.screens.loading.header')}
    </OverlayTitle>
  );
};

ConnectingScreen.displayName = 'ConnectingScreen';

export default React.memo(ConnectingScreen);
