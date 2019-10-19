import React from 'react';
import PropTypes from 'prop-types';

// import GameCanvas from '@game/network/client/gameplay/GameCanvas';
import {styled} from '@pkg/fast-stylesheet/src/react';

import {SSRRenderSwitch} from '@ui/basic-components';
import ProvideI18n from '@ui/i18n/components/ProvideI18n';
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

const RootContainer = ({i18n}) => (
  <ProvideI18n {...i18n}>
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
  </ProvideI18n>
);

RootContainer.displayName = 'RootContainer';

RootContainer.propTypes = {
  i18n: PropTypes.shape(
    {
      lang: PropTypes.string,
      pack: PropTypes.any,
    },
  ).isRequired,
};

export default RootContainer;
