import React from 'react';
import PropTypes from 'prop-types';

import {CRIMSON_RED} from '@ui/colors';

import {useI18n} from '@ui/i18n';
import {styled} from '@pkg/fast-stylesheet/src/react';
import {reactFormat} from '@pkg/basic-helpers/base/format';

import TitledOverlay from '../parts/TitledOverlay';
import {Keymap} from '../parts';

const KeymapFooter = styled(
  Keymap,
  {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    opacity: 0.5,
  },
);

const SecondsTitle = styled.span(
  {
    margin: [0, 5],
    color: CRIMSON_RED,
    verticalAlign: 'middle',
    fontSize: '22px',
  },
);

const RaceCountdown = ({countdown}) => {
  const t = useI18n();

  return (
    <TitledOverlay>
      {reactFormat(
        t('game.racing.race_starts_in'),
        [
          <SecondsTitle key='seconds'>
            {countdown + 1}
          </SecondsTitle>,
        ],
      )}

      <KeymapFooter />
    </TitledOverlay>
  );
};

RaceCountdown.displayName = 'RaceCountdown';

RaceCountdown.propTypes = {
  countdown: PropTypes.number.isRequired,
};

export default React.memo(RaceCountdown);
