import React from 'react';

import {usePromise} from '@pkg/basic-hooks';

import {AsyncLockButton} from '@ui/basic-components';
import {
  GameCardsList,
  GameRoadCard,
} from '../../../components/ui';

const RoomMapsList = ({gameBoard, onRequestMap}) => {
  const {client} = gameBoard;
  const {result: maps} = usePromise(::client.fetchMapsList);

  return (
    <GameCardsList>
      {(maps?.list || []).map(
        ({id, title, thumbnail}) => (
          <li key={id}>
            <AsyncLockButton
              component={GameRoadCard}
              road={{
                title,
                thumbnail,
              }}
              onClick={
                () => onRequestMap(
                  {
                    id,
                  },
                )
              }
            />
          </li>
        ),
      )}
    </GameCardsList>
  );
};

RoomMapsList.displayName = 'RoomMapsList';

export default React.memo(RoomMapsList);
