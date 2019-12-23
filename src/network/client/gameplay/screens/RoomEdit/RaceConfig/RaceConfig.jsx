import React from 'react';
import {useI18n} from '@ui/i18n';
import {
  GameInlineFormGroup,
  GameRangeInput,
} from '../../../components/ui';

const RaceConfig = () => {
  const t = useI18n('game.screens.room_edit.race_config');

  return (
    <div>
      <GameInlineFormGroup
        label={
          t('players_count')
        }
        input={(
          <GameRangeInput />
        )}
      />
    </div>
  );
};

RaceConfig.displayName = 'RaceConfig';

export default RaceConfig;
