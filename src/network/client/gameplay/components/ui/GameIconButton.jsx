import React from 'react';

import {injectClassesStylesheet} from '@pkg/fast-stylesheet/src/react';
import GameButton from './GameButton';

const styles = {
  base: {},

  icon: {
    '& > img': {
      maxWidth: '100%',
      maxHeight: '100%',
    },
  },

  title: {
    marginLeft: 10,
  },
};

const GameIconButton = ({classes, icon, children, ...props}) => (
  <GameButton {...props}>
    <span className={classes.icon}>
      {icon}
    </span>

    {children && (
      <span className={classes.title}>
        {children}
      </span>
    )}
  </GameButton>
);

GameIconButton.displayName = 'GameIconButton';

export default injectClassesStylesheet(
  styles,
  {
    index: 4,
  },
)(GameIconButton);
