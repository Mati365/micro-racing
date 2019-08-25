import React from 'react';

import GameCanvas from '@game/network/client/gameplay/GameCanvas';
import {styled} from '@pkg/fast-stylesheet/src/react';

const Container = styled.div(
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',

    '@global': {
      'body, html': {
        margin: 0,
        padding: 0,
      },
    },
  },
  {
    index: 1,
  },
);

const RootContainer = () => (
  <Container>
    <GameCanvas
      dimensions={{
        w: 800,
        h: 600,
      }}
    />
  </Container>
);

RootContainer.displayName = 'RootContainer';

export default RootContainer;
