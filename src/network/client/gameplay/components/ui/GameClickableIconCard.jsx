import React from 'react';
import c from 'classnames';

import {WHITE} from '@ui/colors';

import {injectClassesStylesheet} from '@pkg/fast-stylesheet/src/react';
import {flexCenteredStyle} from '@ui/basic-components/styled/Flex';

import {Margin} from '@ui/basic-components/styled';
import GameClickableCard from './GameClickableCard';

const GameClickableIconCard = ({icon, title, classes, className, children, ...props}) => (
  <GameClickableCard
    square={false}
    className={c(
      className,
      classes.base,
    )}
    {...props}
  >
    {icon && (
      <span className={classes.icon}>
        {icon}
      </span>
    )}

    {children}

    {title && (
      <Margin
        className={classes.title}
        top={2}
        block
      >
        {title}
      </Margin>
    )}
  </GameClickableCard>
);

GameClickableIconCard.displayName = 'GameClickableIconCard';

export default injectClassesStylesheet(
  {
    base: {
      extend: flexCenteredStyle,
      userSelect: 'none',
    },

    icon: {
      width: '40%',
      opacity: 0.25,

      '& > img': {
        width: '100%',
      },
    },

    title: {
      position: 'absolute',
      left: 0,
      bottom: 8,
      width: '100%',
      textAlign: 'center',
      color: WHITE,
      textTransform: 'uppercase',
      fontSize: '11px',
      fontWeight: 900,
      opacity: 0.5,
    },
  },
)(GameClickableIconCard);
