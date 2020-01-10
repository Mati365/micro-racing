import React, {useEffect, useState, useImperativeHandle, useRef} from 'react';
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
    flexWrap: 'nowrap',
    width: '100%',
    height: 48,
    maxWidth: 640,
    overflowX: 'hidden',
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

// eslint-disable-next-line prefer-template
export const formatLapTime = time => (time / 1000).toFixed(3) + 's';

const PlayerTab = injectClassesStylesheet(
  {
    base: {
      position: 'relative',
      flexDirection: 'row',
      flexShrink: 0,
      textAlign: 'left',
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

    secondary: {
      '& > div': {
        opacity: 0.4,
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
  React.forwardRef(
    ({
      classes,
      player: {
        nick,
        racingState,
      },
      totalLaps,
      currentPlayer,
    }, ref) => {
      const lapNode = useRef();
      const lapNthNode = useRef();

      const elementNode = useRef();
      const positionNode = useRef();

      useImperativeHandle(
        ref,
        () => ({
          setPosition: (() => {
            let prevPosition = null;

            return (position) => {
              const {current: node} = elementNode;
              if (node) {
                if (position === prevPosition)
                  return;

                node.style.order = position;
                if (positionNode.current)
                  positionNode.current.textContent = `#${position || ''}`;

                prevPosition = position;
              }
            };
          })(),

          setLap: (nth) => {
            const {current: node} = lapNthNode;
            if (node)
              node.textContent = `${nth + 1} / ${totalLaps}`;
          },

          setLapTime: (time) => {
            const {current: node} = lapNode;
            if (node)
              node.textContent = formatLapTime(time);
          },
        }),
      );

      return (
        <li
          ref={elementNode}
          className={c(
            classes.base,
            !currentPlayer && classes.secondary,
          )}
          style={{
            order: racingState.position,
          }}
        >
          <div
            ref={positionNode}
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
              <span ref={lapNthNode}>
                {`${racingState.lap + 1} / ${totalLaps}`}
              </span>
              <span ref={lapNode}>
                {formatLapTime(racingState.currentLapTime)}
              </span>
            </div>
          </div>
        </li>
      );
    },
  ),
);

const PlayersTabs = ({gameBoard}) => {
  const playersHandlesRef = useRef();
  const readStateRef = useRef();

  const [totalLaps, setTotalLaps] = useState(null);
  const [playersNodes, setPlayersNodes] = useState(
    {
      list: [],
      current: null,
    },
  );

  readStateRef.current = () => playersNodes;

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

            const {current: playersHandles} = playersHandlesRef;
            const {nodes, currentPlayerNode} = players;
            const newState = {
              list: R.values(nodes),
              current: currentPlayerNode,
            };

            if (readStateRef.current().current === null)
              setPlayersNodes(newState);
            else {
              const {list} = newState;

              for (let i = list.length - 1; i >= 0; --i) {
                const {player} = list[i];
                const handle = playersHandles[player.id];

                if (handle) {
                  const {racingState} = player;

                  handle.setLapTime(racingState.currentLapTime);
                  handle.setLap(racingState.lap);
                  handle.setPosition(racingState.position);
                } else {
                  setPlayersNodes(newState);
                  break;
                }
              }
            }
          },
          true,
        ),
      );
    },
    [gameBoard],
  );

  const slicedList = (
    playersNodes.list.length > 14
      ? R.slice(0, 14, playersNodes.list)
      : playersNodes.list
  );

  playersHandlesRef.current = {};

  return (
    <PlayersTabsWrapper>
      {slicedList.map(
        ({player}, index) => (
          <PlayerTab
            key={player.id}
            ref={(element) => {
              playersHandlesRef.current[player.id] = element;
            }}
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
