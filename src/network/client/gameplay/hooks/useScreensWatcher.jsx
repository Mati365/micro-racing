import {useEffect} from 'react';
import {useHistory} from 'react-router-dom';

import {
  RACE_STATES,
  PLAYER_ACTIONS,
} from '@game/network/constants/serverCodes';

import {requiredParam} from '@pkg/basic-helpers';

import {useLowLatencyObservable} from '@pkg/basic-hooks';
import useClientChainListener from './useClientChainListener';

const useScreensWatcher = (
  {
    currentScreen = requiredParam(),
    gameBoard = requiredParam(),
  },
) => {
  const history = useHistory();

  const onLeaveRoom = async () => {
    await gameBoard.client.leaveRoom();
    history.push('/config');
  };

  const onGoToScore = async () => {
    history.push(
      '/score',
      {
        gameBoard,
      },
    );
  };

  const onGoToBoard = async () => {
    history.push(
      '/config/room-edit',
      {
        gameBoard: await gameBoard.forkOffscreen(),
      },
    );
  };

  const onStopRacing = async () => {
    await gameBoard.client.stopRace();
    history.push(
      '/config/room-edit',
      {
        gameBoard: await gameBoard.forkOffscreen(),
      },
    );
  };

  const onLeaveRacing = async () => {
    history.push(
      '/config/room-edit',
      {
        gameBoard: await gameBoard.forkOffscreen(),
      },
    );
  };

  const onGoToRace = () => history.push(
    '/race',
    {
      gameBoard,
    },
  );

  useLowLatencyObservable(
    {
      observable: gameBoard.observers.roomInfo,
      watchOnly: true,
      onChange: (info) => {
        if (!info?.state)
          return;

        switch (info.state.type) {
          case RACE_STATES.BOARD_VIEW:
            if (currentScreen !== RACE_STATES.BOARD_VIEW)
              onLeaveRacing();
            break;

          case RACE_STATES.PREPARE_TO_RACE:
            if (currentScreen === RACE_STATES.BOARD_VIEW)
              onGoToRace();
            break;

          case RACE_STATES.ALL_FINISH:
            if (currentScreen === RACE_STATES.RACE)
              onGoToScore();
            break;

          default:
        }
      },
    },
  );

  useClientChainListener(
    {
      client: gameBoard.client,
      action: PLAYER_ACTIONS.YOU_ARE_KICKED,
      method: onLeaveRoom,
      afterReleaseFn: () => {
        gameBoard?.release();
      },
    },
  );

  useEffect(
    () => () => {
      gameBoard?.release();
    },
    [],
  );

  return {
    onGoToBoard,
    onGoToRace,
    onLeaveRoom,
    onLeaveRacing,
    onGoToScore,
    onStopRacing,
  };
};

export default useScreensWatcher;
