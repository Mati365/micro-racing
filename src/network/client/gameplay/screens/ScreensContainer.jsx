import React, {useCallback} from 'react';
import {Route, MemoryRouter} from 'react-router-dom';

import {withSSRSwitch} from '@ui/basic-components/SSRRenderSwitch';
import useClientSocket from '../hooks/useClientSocket';

import ConfigChooseScreen from './ConfigChoose';
import {GameCanvasHolder} from '../components';
import ServersList from './ServersList';

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
    <GameCanvasHolder>
      <MemoryRouter>
        <Route
          path='/servers-list'
          render={
            () => <ServersList client={client} />
          }
        />
        <Route
          exact
          path='/'
          render={
            ({history}) => <ConfigChooseScreen onConfigSet={onConfigSet(history)} />
          }
        />
      </MemoryRouter>
    </GameCanvasHolder>
  );
};

ScreensContainer.displayName = 'ScreensContainer';

export default withSSRSwitch(
  {
    allowSSR: false,
  },
)(ScreensContainer);
