import React, {useState, useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';

import {DIMENSIONS_SCHEMA} from '@ui/schemas';
import {RACE_STATES} from '@game/network/constants/serverCodes';

import {createObservablesUnmounter} from '@pkg/basic-helpers/async/createLowLatencyObservable';

import * as Hud from '../../components/hud';
import {
  RaceLapToolbar,
  GameCanvasHolder,
} from '../../components';

import * as Overlays from '../../components/overlays';
import RenderableGameBoard from '../../states/RenderableGameBoard';
import RaceSidebar from './RaceSidebar';

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
      // remove old map
      gameBoard.release();

      const renderableBoard = new RenderableGameBoard(
        {
          client,
          canvas: canvasRef.current,
          aspectRatio: 1.05,
        },
      );

      const unmountObservables = createObservablesUnmounter(
        renderableBoard.observers.raceState.subscribe(
          state => mergeGameState.current(
            {
              state,
            },
          ),
        ),

        renderableBoard.observers.roomMap.subscribe(
          ({
            roomInfo: {
              state,
              config,
            },
            refsStore: {
              roadNodes,
            },
          }) => mergeGameState.current(
            {
              state,
              roomConfig: config,
              roadsSegments: R.pluck('segmentsInfo', roadNodes),
            },
          ),
        ),
      );

      (async () => {
        mergeGameState.current(
          {
            board: renderableBoard,
          },
        );

        await renderableBoard.loadInitialRoomState(
          await client.getRoomInitialState(),
        );

        renderableBoard.start();
      })();

      return () => {
        unmountObservables();
        renderableBoard.release();
      };
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

  const hud = (!overlayModal
  && gameState.state.type === RACE_STATES.RACE
  && roomConfig
  && gameState.board
  && (
    <>
      <Hud.Minimap
        roadsSegments={roadsSegments}
        playersAccessorFn={
          () => gameState.board.refsStore.players
        }
      />

      <Hud.NetworkStats client={client} />
    </>
  ));

  /* eslint-disable jsx-a11y/tabindex-no-positive */
  return (
    <GameCanvasHolder
      direction='row'
      freeze={
        gameState.state.type !== RACE_STATES.RACE
      }
    >
      <div>
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
      </div>
      {gameState.board && (
        <RaceSidebar gameBoard={gameState.board} />
      )}
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
