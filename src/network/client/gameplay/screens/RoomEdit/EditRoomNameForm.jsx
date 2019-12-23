import React from 'react';
import * as R from 'ramda';

import {useLowLatencyObservable} from '@pkg/basic-hooks';

import {OptimisticForm} from '@ui/basic-components';
import {GameInput} from '../../components/ui';

const RoomEditInnerForm = ({l, optimisticValueLink, gameBoard}) => {
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
      style={{
        width: 400,
      }}
    />
  );
};

const RoomEditName = React.memo(({gameBoard}) => (
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
));

export default RoomEditName;
