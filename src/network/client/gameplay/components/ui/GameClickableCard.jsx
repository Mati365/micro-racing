import Color from 'color';

import {
  CRIMSON_RED,
  CRIMSON_RED_DARKEN_5,
  DARKEST_GRAY,
} from '@ui/colors';

import {styled} from '@pkg/fast-stylesheet/src/react';
import GameCard from './GameCard';

const GameClickableCard = styled(
  GameCard,
  {
    base: {
      cursor: 'pointer',
      flexShrink: 0,
      transition: 'border-color 100ms ease-in-out',
      boxShadow: '0 0.2rem transparent',

      '&:hover': {
        borderColor: Color(DARKEST_GRAY).lighten(0.5).hex(),
      },
    },

    disabled: {
      opacity: 0.5,
      cursor: 'default',
      pointerEvents: 'none',
    },

    'size-auto': {
      width: '100%',
      paddingBottom: '100%',
    },

    'size-small': {
      width: 100,
      paddingBottom: 100,
    },

    'size-medium': {
      width: 150,
      paddingBottom: 150,
    },

    'size-big': {
      width: 200,
      paddingBottom: 200,
    },

    active: {
      borderColor: `${CRIMSON_RED} !important`,
      boxShadow: `0 0.2rem ${CRIMSON_RED_DARKEN_5}`,
      borderWidth: 2,
      borderStyle: 'solid',
    },
  },
  {
    index: 4,
    props: {
      square: true,
    },
    omitProps: ['active', 'size', 'disabled'],
    classSelector: (classes, {active, size, disabled}) => [
      active && classes.active,
      disabled && classes.disabled,
      classes[`size-${size || 'medium'}`],
    ],
  },
);

GameClickableCard.displayName = 'GameClickableCard';

export default GameClickableCard;
