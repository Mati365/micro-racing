import {
  BLACK,
  WHITE,
  WHITE_DARKEN_5,
  CRIMSON_RED,
  CRIMSON_RED_DARKEN_5,
  DODGER_BLUE,
  DODGER_BLUE_DARKEN_5,
  GRASS_GREEN,
  GRASS_GREEN_DARKEN_5,
} from '@ui/colors';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {TextButton} from '@ui/basic-components/styled';

/**
 * @see {@link https://codepen.io/DanielWeiner/pen/iFadn}
 *      {@link https://www.crazygames.com/game/survivio}
 */
const GameButton = styled(
  TextButton,
  {
    base: {
      cursor: 'pointer',
      textShadow: '0 1px 2px rgba(0,0,0,.25)',
      borderRadius: 7,
      padding: [7, 10],
      textAlign: 'center',
      textTransform: 'uppercase',
      fontWeight: 900,
      userSelect: 'none',

      '&:hover': {
        textDecoration: 'none',
      },

      '&:active': {
        boxShadow: 'none',
        position: 'relative',
        top: '.2em',
      },
    },

    cornered: {
      position: 'absolute',
      right: 0,
      bottom: 0,
    },

    disabled: {
      opacity: 0.5,
      cursor: 'default',
    },

    expanded: {
      width: '100%',
    },

    'size-tiny': {
      padding: 5,
      fontSize: '10px',
      letterSpacing: '1px',
    },

    'type-blue': {
      color: WHITE,
      background: DODGER_BLUE,
      boxShadow: `0 0.2em ${DODGER_BLUE_DARKEN_5}`,
    },

    'type-green': {
      color: WHITE,
      background: GRASS_GREEN,
      boxShadow: `0 0.2em ${GRASS_GREEN_DARKEN_5}`,
    },

    'type-red': {
      color: WHITE,
      background: CRIMSON_RED,
      boxShadow: `0 0.2em ${CRIMSON_RED_DARKEN_5}`,
    },


    'type-white': {
      color: BLACK,
      background: WHITE,
      boxShadow: `0 0.2em ${WHITE_DARKEN_5}`,
    },
  },
  {
    index: 3,
    omitProps: ['type', 'expanded', 'size', 'cornered'],
    classSelector: (classes, {type, disabled, expanded, size, cornered}) => [
      classes[`type-${type}`],
      expanded && classes.expanded,
      disabled && classes.disabled,
      size && classes[`size-${size}`],
      cornered && classes.cornered,
    ],
  },
);

GameButton.displayName = 'GameButton';

export default GameButton;
