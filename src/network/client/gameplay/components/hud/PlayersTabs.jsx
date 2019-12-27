import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import c from 'classnames';
import * as R from 'ramda';

import {
  WHITE,
  DARK_GRAY,
} from '@ui/colors';

import {
  styled,
  injectClassesStylesheet,
} from '@pkg/fast-stylesheet/src/react';

import {createObservablesUnmounter} from '@pkg/basic-helpers/async/createLowLatencyObservable';

import UnorderedList from '@ui/basic-components/styled/UnorderedList';
import GameBoard from '../../states/GameBoard';

const PlayersTabsWrapper = styled(
  UnorderedList,
  {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 1,
    width: '100%',
    height: 48,
    lineHeight: '48px',
    maxHeight: '100%',
    overflow: 'hidden',
    color: WHITE,
  },
  {
    props: {
      row: true,
    },
  },
);

const PlayerTab = injectClassesStylesheet(
  {
    base: {
      position: 'relative',
      flexDirection: 'row',
      flexShrink: 0,
      textAlign: 'left',
    },

    secondary: {
      '& > div': {
        opacity: 0.4,
      },
    },

    notLast: {
      paddingRight: 30,

      '&:after': {
        content: '""',
        position: 'absolute',
        top: '10%',
        right: 13,

        width: 1,
        height: '80%',
        background: DARK_GRAY,

        opacity: 0.35,
      },
    },

    position: {
      marginRight: 10,
      fontWeight: 700,
      lineHeight: '29px',
    },

    content: {
      fontSize: '12px',
      lineHeight: '12px',
    },

    nick: {
      marginBottom: 5,
      fontWeight: 700,
    },

    time: {
      textAlign: 'left',
      color: DARK_GRAY,

      '& > span:first-child': {
        marginRight: 10,
      },

      '& > span:last-child': {
        float: 'right',
      },
    },
  },
)(
  ({classes, player: {nick, racingState}, totalLaps, last, currentPlayer}) => (
    <li
      className={c(
        classes.base,
        !last && classes.notLast,
        !currentPlayer && classes.secondary,
      )}
      style={{
        order: racingState.position,
      }}
    >
      <div
        className={classes.position}
        style={{
          color: racingState.color,
        }}
      >
        {`#${racingState.position || ''}`}
      </div>

      <div className={classes.content}>
        <div className={classes.nick}>
          {nick}
        </div>

        <div className={classes.time}>
          <span>
            {`${racingState.lap + 1} / ${totalLaps}`}
          </span>
          <span>
            {`${(racingState.currentLapTime / 1000).toFixed(3)}s`}
          </span>
        </div>
      </div>
    </li>
  ),
);

const PlayersTabs = ({gameBoard}) => {
  const [totalLaps, setTotalLaps] = useState(null);
  const [playersNodes, setPlayersNodes] = useState(
    {
      list: [],
      current: null,
    },
  );

  useEffect(
    () => {
      if (!gameBoard)
        return undefined;

      return createObservablesUnmounter(
        gameBoard.observers.roomInfo.subscribe(
          (roomInfo) => {
            if (roomInfo)
              setTotalLaps(roomInfo.config.laps);
          },
          true,
        ),

        gameBoard.observers.players.subscribe(
          (players) => {
            if (!players)
              return;

            const {nodes, currentPlayerNode} = players;
            setPlayersNodes(
              {
                list: R.values(nodes),
                current: currentPlayerNode,
              },
            );
          },
          true,
        ),
      );
    },
    [gameBoard],
  );

  const slicedList = (
    playersNodes.list.length > 4
      ? R.slice(0, 4, playersNodes.list)
      : playersNodes.list
  );

  return (
    <PlayersTabsWrapper>
      {slicedList.map(
        ({player}, index) => (
          <PlayerTab
            key={player.id}
            player={player}
            totalLaps={totalLaps}
            currentPlayer={
              player.id === playersNodes.current.player.id
            }
            last={
              (player.racingState.position || index + 1) === slicedList.length
            }
          />
        ),
      )}
    </PlayersTabsWrapper>
  );
};

PlayersTabs.displayName = 'PlayersTabs';

PlayersTabs.propTypes = {
  gameBoard: PropTypes.instanceOf(GameBoard),
};

PlayersTabs.defaultProps = {
  gameBoard: null,
};

export default React.memo(PlayersTabs);
