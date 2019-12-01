import React from 'react';
import PropTypes from 'prop-types';

import {useI18n} from '@ui/i18n';
import TitledOverlay from '../TitledOverlay';

const RaceCountdown = ({countdown}) => {
  const t = useI18n();

  return (
    <TitledOverlay>
      {t('game.racing.race_starts_in', [countdown + 1])}
    </TitledOverlay>
  );
};

RaceCountdown.displayName = 'RaceCountdown';

RaceCountdown.propTypes = {
  countdown: PropTypes.number.isRequired,
};

export default React.memo(RaceCountdown);
