import React from 'react';

import {useI18n} from '@ui/i18n';
import {OverlayTitle} from './TitledOverlay';

const LoadingOverlay = () => {
  const t = useI18n();

  return (
    <OverlayTitle>
      {t('game.shared.loading')}
    </OverlayTitle>
  );
};

LoadingOverlay.displayName = 'LoadingOverlay';

export default React.memo(LoadingOverlay);
