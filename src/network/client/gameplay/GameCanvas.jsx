import React, {useState, useRef, useEffect} from 'react';

import {DIMENSIONS_SCHEMA} from '@ui/schemas';
import {RACE_STATES} from '@game/network/constants/serverCodes';

import {ssr} from '@pkg/basic-helpers';
import usePromise from '@ui/basic-hooks/async/usePromise';

import PlayerClientSocket from '../protocol/PlayerClientSocket';

import {
  RaceRoomInfoToolbar,
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
      state: {
        type: RACE_STATES.WAIT_FOR_SERVER,
      },
    },
  );

  const {roomConfig} = gameState;
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
            listeners: {
              onUpdateRaceState: state => mergeGameState.current(
                {
                  state,
                },
              ),

              onLoadRoomMap: ({state, config}) => mergeGameState.current(
                {
                  state,
                  roomConfig: config,
                },
              ),
            },
          },
        );

        await board.setCanvas(
          {
            canvas: canvasRef.current,
            aspectRatio: 1.05,
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

  let overlay = null;
  switch (gameState.state.type) {
    case RACE_STATES.WAIT_FOR_SERVER:
      overlay = <Overlays.WaitingForServer />;
      break;

    case RACE_STATES.COUNT_TO_START:
      overlay = <Overlays.RaceCountdown countdown={gameState.state.payload.countdown} />;
      break;

    default:
  }

  /* eslint-disable jsx-a11y/tabindex-no-positive */
  return (
    <GameCanvasHolder freeze={gameState.state.type !== RACE_STATES.RACE}>
      {roomConfig && (
        <RaceLapToolbar
          lap={1}
          totalLaps={roomConfig.laps}
        />
      )}
      <div>
        <canvas
          tabIndex={1}
          ref={canvasRef}
          width={dimensions.w}
          height={dimensions.h}
        />
      </div>
      {roomConfig && !overlay && (
        <RaceRoomInfoToolbar />
      )}

      {overlay}
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
