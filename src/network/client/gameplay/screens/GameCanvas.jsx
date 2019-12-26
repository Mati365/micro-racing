import React, {useState, useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';

import {DIMENSIONS_SCHEMA} from '@ui/schemas';
import {RACE_STATES} from '@game/network/constants/serverCodes';

import * as Hud from '../components/hud';
import {
  RaceLapToolbar,
  GameCanvasHolder,
} from '../components';

import * as Overlays from '../components/overlays';

const GameCanvas = ({dimensions, gameBoard}) => {
  const canvasRef = useRef();
  const [gameState, setGameState] = useState(
    {
      board: null,
      state: {
        type: RACE_STATES.WAIT_FOR_SERVER,
      },
    },
  );

  const {client} = gameBoard;
  const {roadsSegments, roomConfig} = gameState;
  const mergeGameState = useRef();

  mergeGameState.current = data => setGameState(
    {
      ...gameState,
      ...data,
    },
  );

  useEffect(
    () => {
      (async () => {
        gameBoard.observers.raceState.subscribe(
          state => mergeGameState.current(
            {
              state,
            },
          ),
        );

        gameBoard.observers.roomMap.subscribe(
          ({state, config, map}) => mergeGameState.current(
            {
              state,
              roomConfig: config,
              roadsSegments: R.pluck('segmentsInfo', map.roadNodes),
            },
          ),
        );

        await gameBoard.setCanvas(
          {
            canvas: canvasRef.current,
            aspectRatio: 1.05,
          },
        );

        mergeGameState.current(
          {
            board: gameBoard,
          },
        );

        gameBoard.start();
      })();
    },
    [],
  );

  let overlayModal = null;
  switch (gameState.state.type) {
    case RACE_STATES.WAIT_FOR_SERVER:
      overlayModal = <Overlays.WaitingForServer />;
      break;

    case RACE_STATES.COUNT_TO_START:
      overlayModal = (
        <Overlays.RaceCountdown countdown={gameState.state.payload.countdown} />
      );
      break;

    default:
  }

  const hud = !overlayModal && roomConfig && gameState.board && (
    <>
      <Hud.Minimap
        roadsSegments={roadsSegments}
        playersAccessorFn={
          () => gameState.board.roomMapNode.players
        }
      />

      <Hud.NetworkStats client={client} />
    </>
  );


  /* eslint-disable jsx-a11y/tabindex-no-positive */
  return (
    <GameCanvasHolder freeze={gameState.state.type !== RACE_STATES.RACE}>
      <RaceLapToolbar gameBoard={gameState.board} />
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
        }}
      >
        <canvas-html-wrapper>
          <canvas
            tabIndex={1}
            ref={canvasRef}
            width={dimensions.w}
            height={dimensions.h}
          />
        </canvas-html-wrapper>
        {hud}
        {overlayModal}
      </div>
    </GameCanvasHolder>
  );
  /* eslint-enable */
};

GameCanvas.displayName = 'GameCanvas';

GameCanvas.propTypes = {
  dimensions: DIMENSIONS_SCHEMA,
  gameBoard: PropTypes.object.isRequired,
};

GameCanvas.defaultProps = {
  dimensions: {
    w: 800,
    h: 600,
  },
};

export default GameCanvas;
