import React from 'react';
import {useI18n} from '@ui/i18n';
import {
  GameLabel,
  GameRangeInput,
} from '../../../components/ui';

const RaceConfig = () => {
  const t = useI18n('game.screens.room_edit.race_config');

  return (
    <>
      <GameLabel>
        {t('players_count')}
      </GameLabel>

      <GameRangeInput />
    </>
  );
};

RaceConfig.displayName = 'RaceConfig';

export default RaceConfig;
