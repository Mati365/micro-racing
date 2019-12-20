import React from 'react';
import PropTypes from 'prop-types';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {
  Switch,
  Route,
} from 'react-router-dom';

import ProvideI18n from '@ui/i18n/components/ProvideI18n';
import {
  IsomorphicRouter,
  SSRRenderSwitch,
} from '@ui/basic-components';

import ScreensContainer from '@game/network/client/gameplay/screens';
import EditorCanvas from './ui/EditorCanvas';
import PhysicsCanvas from './ui/PhysicsCanvas/PhysicsCanvas';

const Container = styled.div(
  {
    base: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'black',
      fontFamily: 'Arial',
    },

    '@global': {
      'body, html': {
        margin: 0,
        padding: 0,

        '& *': {
          boxSizing: 'border-box',
        },
      },
    },
  },
  {
    index: 1,
  },
);

const editorRoute = Component => () => (
  <SSRRenderSwitch>
    {() => (
      <Component
        dimensions={{
          w: window.innerWidth,
          h: window.innerHeight,
        }}
      />
    )}
  </SSRRenderSwitch>
);

const RootContainer = ({i18n, routerProps}) => (
  <ProvideI18n {...i18n}>
    <Container>
      <IsomorphicRouter {...routerProps}>
        <Switch>
          <Route path='/physics' component={editorRoute(PhysicsCanvas)} />
          <Route path='/editor' component={editorRoute(EditorCanvas)} />
          <Route path='/' component={ScreensContainer} />
        </Switch>
      </IsomorphicRouter>
    </Container>
  </ProvideI18n>
);

RootContainer.displayName = 'RootContainer';

RootContainer.propTypes = {
  routerProps: PropTypes.object,
  i18n: PropTypes.shape(
    {
      lang: PropTypes.string,
      pack: PropTypes.any,
    },
  ).isRequired,
};

RootContainer.defaultProps = {
  routerProps: {},
};

export default RootContainer;
