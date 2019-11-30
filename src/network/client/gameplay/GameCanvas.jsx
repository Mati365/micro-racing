import React, {useRef, useEffect} from 'react';

import {DIMENSIONS_SCHEMA} from '@ui/schemas';

import {ssr} from '@pkg/basic-helpers';
import usePromise from '@ui/basic-hooks/async/usePromise';

import PlayerClientSocket from '../protocol/PlayerClientSocket';
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
