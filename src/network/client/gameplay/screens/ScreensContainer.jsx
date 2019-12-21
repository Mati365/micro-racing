import React, {useCallback} from 'react';
import {Route, MemoryRouter} from 'react-router-dom';

import {styled} from '@pkg/fast-stylesheet/src/react';

import {withSSRSwitch} from '@ui/basic-components/SSRRenderSwitch';
import useClientSocket from '../hooks/useClientSocket';

import ConfigChooseScreen from './ConfigChoose';
import {GameCanvasHolder} from '../components';
import ServersList from './ServersList';
import RoomEdit from './RoomEdit';

const ScreensHolder = styled(
  GameCanvasHolder,
  {
    flexDirection: 'row',
  },
);

const BoardContainer = styled.div(
  {
    '&:not(:empty)': {
      marginLeft: 40,
    },
  },
);

const ScreensContainer = () => {
  const {
    connect,
    client,
  } = useClientSocket();

  const onConfigSet = useCallback(
    history => async ({nick, carType}) => {
      const _client = await connect(
        {
          playerInfo: {
            nick,
            carType,
          },
        },
      );

      history.push('/servers-list');
      return _client;
    },
    [connect],
  );

  return (
    <ScreensHolder>
      <MemoryRouter>
        <Route
          render={
            ({history}) => (
              <ConfigChooseScreen
                created={!!client}
                onConfigSet={onConfigSet(history)}
              />
            )
          }
        />

        <BoardContainer>
          <Route
            path='/room-edit'
            render={
              ({location: {state}}) => (
                <RoomEdit
                  client={client}
                  room={state.room}
                />
              )
            }
          />

          <Route
            path='/servers-list'
            render={
              () => <ServersList client={client} />
            }
          />
        </BoardContainer>
      </MemoryRouter>
    </ScreensHolder>
  );
};

ScreensContainer.displayName = 'ScreensContainer';

export default withSSRSwitch(
  {
    allowSSR: false,
  },
)(ScreensContainer);
