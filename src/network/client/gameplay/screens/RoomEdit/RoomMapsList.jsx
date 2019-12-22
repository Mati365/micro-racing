import React from 'react';

import {usePromise} from '@pkg/basic-hooks';

import {
  GameCardsList,
  GameRoadCard,
} from '../../components/ui';

const RoomMapsList = ({client}) => {
  const {result: maps} = usePromise(::client.fetchMapsList);

  return (
    <GameCardsList>
      {(maps?.list || []).map(
        ({id, title, thumbnail}) => (
          <li key={id}>
            <GameRoadCard
              road={{
                title,
                thumbnail,
              }}
            />
          </li>
        ),
      )}
    </GameCardsList>
  );
};

RoomMapsList.displayName = 'RoomMapsList';

export default React.memo(RoomMapsList);
