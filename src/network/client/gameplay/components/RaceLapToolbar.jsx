import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';

import * as COLORS from '@ui/colors';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {useI18n} from '@ui/i18n';
import {createObservablesUnmounter} from '@pkg/basic-helpers/async/createLowLatencyObservable';

import {PlayersTabs} from './hud';
import GameBoard from '../states/GameBoard';

const RaceLapToolbarWrapper = styled.div(
  {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: 48,
    lineHeight: '48px',
    maxHeight: '100%',
    color: COLORS.WHITE,
  },
);

const CurrentLapTitle = styled.span(
  {
    fontSize: 27,
    fontWeight: 'bold',
  },
);

const CurrentLapLabel = styled.span(
  {
    marginRight: 10,
    textTransform: 'uppercase',
    fontSize: 12,
    color: COLORS.DARK_GRAY,
  },
);

const CornerWrapper = styled.span(
  {
    marginLeft: 'auto',
    paddingLeft: 20,
    flexShrink: 0,
  },
);

const RaceLapToolbar = ({gameBoard}) => {
  const t = useI18n();
  const [totalLaps, setTotalLaps] = useState(null);
  const [laps, setLaps] = useState(null);

  useEffect(
    () => {
      if (!gameBoard)
        return undefined;

      return createObservablesUnmounter(
        gameBoard.observers.roomInfo.subscribe(
          ({config}) => {
            setTotalLaps(config.laps);
          },
        ),

        gameBoard.observers.players.subscribe(
          ({currentPlayerNode}) => {
            setLaps(currentPlayerNode.player.racingState.lap + 1);
          },
        ),
      );
    },
    [gameBoard],
  );

  return (
    <RaceLapToolbarWrapper>
      <PlayersTabs gameBoard={gameBoard} />
      <CornerWrapper>
        <CurrentLapLabel>
          {t('game.racing.current_lap')}
        </CurrentLapLabel>

        <CurrentLapTitle>
          {`${R.defaultTo('-', laps)} / ${R.defaultTo('-', totalLaps)}`}
        </CurrentLapTitle>
      </CornerWrapper>
    </RaceLapToolbarWrapper>
  );
};

RaceLapToolbar.displayName = 'RaceLapToolbar';

RaceLapToolbar.propTypes = {
  gameBoard: PropTypes.instanceOf(GameBoard),
};

RaceLapToolbar.defaultProps = {
  gameBoard: null,
};

export default React.memo(RaceLapToolbar);
