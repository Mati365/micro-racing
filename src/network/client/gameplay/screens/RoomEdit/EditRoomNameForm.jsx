import React from 'react';
import * as R from 'ramda';

import {useLowLatencyObservable} from '@pkg/basic-hooks';

import {OptimisticForm} from '@ui/basic-components';
import {GameInput} from '../../components/ui';

import useIsClientBoardOP from '../../hooks/useIsClientBoardOP';

const RoomEditInnerForm = ({l, optimisticValueLink, gameBoard}) => {
  const op = useIsClientBoardOP(gameBoard);

  useLowLatencyObservable(
    {
      observable: gameBoard.observers.roomInfo,
      watchOnly: true,
      onChange: (info) => {
        if (!info)
          return;

        const {name} = info;
        if (name !== l.value)
          optimisticValueLink.setValue(name);
      },
    },
  );

  return (
    <GameInput
      {...l.input()}
      disabled={!op}
      style={{
        width: 400,
      }}
    />
  );
};

const RoomEditName = ({gameBoard}) => (
  <OptimisticForm
    selectorFn={
      R.propOr('', 'name')
    }
    asyncSubmitFn={
      async name => gameBoard.client.setRoomInfo(
        {
          name,
        },
      )
    }
  >
    {({l, optimisticValueLink}) => (
      <RoomEditInnerForm
        {...{
          l,
          optimisticValueLink,
          gameBoard,
        }}
      />
    )}
  </OptimisticForm>
);

export default React.memo(RoomEditName);
