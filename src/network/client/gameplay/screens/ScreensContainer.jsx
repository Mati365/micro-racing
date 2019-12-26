import React, {useEffect} from 'react';
import {
  Route,
  MemoryRouter,
  Switch,
} from 'react-router-dom';

import {styled} from '@pkg/fast-stylesheet/src/react';

import useClientSocket from '../hooks/useClientSocket';

import {GameCanvasHolder} from '../components';
import {GameScrollbars} from '../components/ui';
import {GamePortalHolder} from '../components/ui/GameLayerPortal';

import ConfigChooseScreen from './ConfigChoose';
import ServersList from './ServersList';
import RoomEdit from './RoomEdit';
import ConnectingScreen from './ConnectingScreen';

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

  useEffect(
    () => {
      connect();
    },
    [],
  );

  const onUpdateConfig = playerInfo => client.setPlayerInfo(playerInfo);

  let content = null;
  if (!client) {
    content = (
      <ConnectingScreen />
    );
  } else {
    content = (
      <MemoryRouter>
        <Route
          render={
            () => (
              <ConfigChooseScreen
                initialData={client.info}
                created={!!client}
                onConfigSet={onUpdateConfig}
              />
            )
          }
        />

        <BoardContainer>
          <Switch>
            <Route
              path='/room-edit'
              render={
                ({location: {state}}) => (
                  <RoomEdit
                    client={client}
                    gameBoard={state.gameBoard}
                  />
                )
              }
            />

            <Route
              render={
                () => <ServersList client={client} />
              }
            />
          </Switch>
        </BoardContainer>
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
