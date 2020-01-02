import {useLowLatencyObservable} from '@pkg/basic-hooks';

const useIsClientBoardOP = gameBoard => useLowLatencyObservable(
  {
    observable: gameBoard.observers.roomInfo,
    parserFn: info => gameBoard.client.info.id === info?.ownerID,
  },
);

export default useIsClientBoardOP;
