import React, {useRef, useEffect} from 'react';

import {DIMENSIONS_SCHEMA} from '@pkg/basic-type-schemas';

import usePromise from '@pkg/basic-hooks/async/usePromise';
// import {useGameBoard} from './states/GameBoard';

import PlayerClientSocket from '../protocol/PlayerClientSocket';
import GameBoard from './states/GameBoard';

const useClientSocket = (
  {
    uri = 'ws://lvh.me:8080',
    initialRoom = 'general',
  } = {},
) => {
  const {loading, result} = usePromise(
    async () => {
      const client = await PlayerClientSocket.connect(uri);

      return {
        client,
        room: (
          initialRoom
            ? await client.joinRoom(initialRoom)
            : null
        ),
      };
    },
    [uri],
  );

  return {
    connecting: loading,
    socketInfo: result,
  };
};

const GameCanvas = ({dimensions}) => {
  const canvasRef = useRef();
  const {
    connecting,
    socketInfo,
  } = useClientSocket();

  useEffect(
    () => {
      if (connecting)
        return;

      (async () => {
        const board = new GameBoard(socketInfo);
        await board.setCanvas(
          {
            canvas: canvasRef.current,
            aspectRatio: 1.05,
          },
        );

        board.start();
      })();
    },
    [connecting],
  );

  return (
    <canvas
      tabIndex={-1}
      ref={canvasRef}
      width={dimensions.w}
      height={dimensions.h}
    />
  );
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
