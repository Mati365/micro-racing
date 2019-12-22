import React from 'react';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {usePromise} from '@pkg/basic-hooks';

import {UnorderedList} from '@ui/basic-components/styled';
import {GameRoadCard} from '../../components/ui';

const MapsListUnorderedList = styled(
  UnorderedList,
  {
    '& li': {
      marginRight: 10,
      marginBottom: 10,
    },
  },
  {
    props: {
      row: true,
    },
  },
);

const RoomMapsList = ({client}) => {
  const {result: maps} = usePromise(::client.fetchMapsList);

  return (
    <MapsListUnorderedList>
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
    </MapsListUnorderedList>
  );
};

RoomMapsList.displayName = 'RoomMapsList';

export default React.memo(RoomMapsList);
