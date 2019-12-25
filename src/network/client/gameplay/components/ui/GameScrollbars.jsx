import React from 'react';
import Color from 'color';

import {DIM_GRAY} from '@ui/colors';
import {injectClassesStylesheet} from '@pkg/fast-stylesheet/src/react';

const SCROLLBAR_SELECTOR = 'game-scrollbars';

const css = {
  base: {},

  '@global': {
    body: {
      [`& ${SCROLLBAR_SELECTOR} *::-webkit-scrollbar-track`]: {
        background: '#0c0c0c',
      },

      [`& ${SCROLLBAR_SELECTOR} *::-webkit-scrollbar`]: {
        width: 8,
        height: 8,
      },

      [`& ${SCROLLBAR_SELECTOR} *::-webkit-scrollbar-thumb`]: {
        transition: 'background 100ms ease-in-out',
        background: DIM_GRAY,
        cursor: 'pointer',

        '&:hover': {
          background: Color(DIM_GRAY).darken(0.2).hex(),
        },
      },
    },
  },
};

const GameScrollbars = ({children, classes, ...props}) => {
  const Component = SCROLLBAR_SELECTOR;
  return (
    <Component {...props}>
      {children}
    </Component>
  );
};

GameScrollbars.displayName = 'GameScrollbars';

export default injectClassesStylesheet(css)(GameScrollbars);
