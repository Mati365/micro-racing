import React from 'react';
import * as R from 'ramda';
import {
  Route,
  Switch,
} from 'react-router-dom';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {capitalize} from '@pkg/basic-helpers';

import ConfigChooseScreen from '../ConfigChoose';
import ServersList from '../ServersList';
import RoomEdit from '../RoomEdit';

const BoardContainer = styled.div(
  {
    '&:not(:empty)': {
      marginLeft: 40,
    },
  },
);

const GameConfigRoute = React.memo(({match, client}) => {
  const onUpdateConfig = playerInfo => client.setPlayerInfo(
    R.evolve(
      {
        nick: capitalize,
      },
    )(playerInfo),
  );

  return (
    <>
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
            path={`${match.path}/room-edit`}
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
    </>
  );
});

GameConfigRoute.displayName = 'GameConfigRoute';

export default GameConfigRoute;
