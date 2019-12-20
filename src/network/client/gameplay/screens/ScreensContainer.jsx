import React, {useCallback} from 'react';
import {Route, MemoryRouter} from 'react-router-dom';

import {withSSRSwitch} from '@ui/basic-components/SSRRenderSwitch';
import useClientSocket from '../hooks/useClientSocket';

import ConfigChooseScreen from './ConfigChoose';
import {GameCanvasHolder} from '../components';

const ScreensContainer = () => {
  const {
    connect,
    // client,
  } = useClientSocket();

  const onConfigSet = useCallback(
    ({nick, carType}) => connect(
      {
        playerInfo: {
          nick,
          carType,
        },
      },
    ),
    [connect],
  );

  return (
    <GameCanvasHolder>
      <MemoryRouter>
        <Route
          path='/'
          render={
            () => <ConfigChooseScreen onConfigSet={onConfigSet} />
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
