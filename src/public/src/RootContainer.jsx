import React from 'react';

// import GameCanvas from '@game/network/client/gameplay/GameCanvas';
import {styled} from '@pkg/fast-stylesheet/src/react';

import {SSRRenderSwitch} from '@ui/basic-components';
import EditorCanvas from './ui/EditorCanvas';

const Container = styled.div(
  {
    base: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
    },

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
    {/* <GameCanvas
      dimensions={{
        w: 800,
        h: 600,
      }}
    /> */}

    <SSRRenderSwitch>
      {() => (
        <EditorCanvas
          dimensions={{
            w: window.innerWidth,
            h: window.innerHeight,
          }}
        />
      )}
    </SSRRenderSwitch>
  </Container>
);

RootContainer.displayName = 'RootContainer';

export default RootContainer;
