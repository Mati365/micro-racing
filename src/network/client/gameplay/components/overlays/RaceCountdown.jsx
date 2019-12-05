import React from 'react';
import PropTypes from 'prop-types';

import {
  WHITE,
  CRIMSON_RED,
} from '@ui/colors';

import {useI18n} from '@ui/i18n';
import {styled} from '@pkg/fast-stylesheet/src/react';
import {reactFormat} from '@pkg/basic-helpers/base/format';

import {Layer} from '@ui/basic-components/styled';

import {OverlayTitle} from '../parts/TitledOverlay';
import {Keymap} from '../parts';

const OverlayExpandedWrapper = styled.div(
  {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    color: WHITE,
  },
);

const KeymapFooterWrapper = styled.div(
  {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    opacity: 0.5,

    '& > table': {
      margin: [0, 'auto'],
    },
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
    <Layer>
      <OverlayExpandedWrapper>
        <OverlayTitle style={{margin: 'auto 0'}}>
          {reactFormat(
            t('game.racing.race_starts_in'),
            [
              <SecondsTitle key='seconds'>
                {countdown + 1}
              </SecondsTitle>,
            ],
          )}
        </OverlayTitle>

        <KeymapFooterWrapper>
          <Keymap />
        </KeymapFooterWrapper>
      </OverlayExpandedWrapper>
    </Layer>
  );
};

RaceCountdown.displayName = 'RaceCountdown';

RaceCountdown.propTypes = {
  countdown: PropTypes.number.isRequired,
};

export default React.memo(RaceCountdown);
