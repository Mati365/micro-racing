import React from 'react';

import {useI18n} from '@ui/i18n';
import {GameHeader} from '../../components/ui';

const RacingConfigColumn = () => {
  const t = useI18n('game.screens.room_edit');

  return (
    <>
      <GameHeader>
        {t('racing_config')}
      </GameHeader>
    </>
  );
};

RacingConfigColumn.displayName = 'RacingConfigColumn';

export default React.memo(RacingConfigColumn);
