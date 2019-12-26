import React, {useEffect} from 'react';
import {
  Route,
  MemoryRouter,
} from 'react-router-dom';

import {styled} from '@pkg/fast-stylesheet/src/react';

import useClientSocket from '../hooks/useClientSocket';

import {GameCanvasHolder} from '../components';
import {GameScrollbars} from '../components/ui';
import {GamePortalHolder} from '../components/ui/GameLayerPortal';

import ConnectingScreen from './ConnectingScreen';
import * as Routes from './Routes';

const ScreensHolder = styled(
  GameCanvasHolder,
  {
    flexDirection: 'row',
  },
);

const ScreensContainer = () => {
  const {
    connect,
    client,
  } = useClientSocket();

  useEffect(
    () => {
      connect();
    },
    [],
  );

  let content = null;
  if (!client) {
    content = (
      <ConnectingScreen />
    );
  } else {
    content = (
      <MemoryRouter initialEntries={['/config']}>
        <Route
          path='/config'
          render={
            ({match}) => (
              <Routes.GameConfigRoute
                match={match}
                client={client}
              />
            )
          }
        />

        <Route
          path='/race'
          render={
            ({location: {state}}) => (
              <Routes.GameRaceRoute gameBoard={state.gameBoard} />
            )
          }
        />
      </MemoryRouter>
    );
  }

  return (
    <GameScrollbars>
      <ScreensHolder>
        {content}
      </ScreensHolder>
      <GamePortalHolder />
    </GameScrollbars>
  );
};

ScreensContainer.displayName = 'ScreensContainer';

export default ScreensContainer;
