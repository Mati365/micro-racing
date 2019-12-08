import React, {useState, useRef, useEffect} from 'react';
import * as R from 'ramda';

import {DIMENSIONS_SCHEMA} from '@ui/schemas';
import {RACE_STATES} from '@game/network/constants/serverCodes';

import {ssr} from '@pkg/basic-helpers';
import usePromise from '@ui/basic-hooks/async/usePromise';

import PlayerClientSocket from '../protocol/PlayerClientSocket';

import * as Hud from './components/hud';
import {
  RaceLapToolbar,
  GameCanvasHolder,
} from './components';

import * as Overlays from './components/overlays';
import GameBoard from './states/GameBoard';

const useClientSocket = (
  {
    uri = `ws://${ssr ? 'lvh.me' : document.domain}:8080`,
  } = {},
) => {
  const {loading, result} = usePromise(
    () => PlayerClientSocket.connect(uri),
    [uri],
  );

  return {
    connecting: loading,
    client: result,
  };
};

const GameCanvas = ({dimensions}) => {
  const canvasRef = useRef();

  const {
    connecting,
    client,
  } = useClientSocket();

  const [gameState, setGameState] = useState(
    {
      board: null,
      state: {
        type: RACE_STATES.WAIT_FOR_SERVER,
      },
    },
  );

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
      if (connecting)
        return;

      (async () => {
        const board = new GameBoard(
          {
            client,
          },
        );

        board.observers.raceState.subscribe(
          state => mergeGameState.current(
            {
              state,
            },
          ),
        );

        board.observers.roomMap.subscribe(
          ({state, config, map}) => mergeGameState.current(
            {
              state,
              roomConfig: config,
              roadsSegments: R.pluck('segmentsInfo', map.roadNodes),
            },
          ),
        );

        await board.setCanvas(
          {
            canvas: canvasRef.current,
            aspectRatio: 1.05,
          },
        );

        mergeGameState.current(
          {
            board,
          },
        );

        await board.loadInitialRoomState(
          await client.joinRoom('general'),
        );

        if (board.roomMapNode.roomInfo.ownerID === client.info.id)
          client.startRace();

        board.start();
      })();
    },
    [connecting],
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
      <div style={{position: 'relative'}}>
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
      {/* {roomConfig && (
        <RaceRoomInfoToolbar roadsSegments={roadsSegments} />
      )} */}
    </GameCanvasHolder>
  );
  /* eslint-enable */
};

GameCanvas.displayName = 'GameCanvas';

GameCanvas.propTypes = {
  dimensions: DIMENSIONS_SCHEMA,
};

GameCanvas.defaultProps = {
  dimensions: {
    w: 640,
    h: 550,
  },
};

export default GameCanvas;
