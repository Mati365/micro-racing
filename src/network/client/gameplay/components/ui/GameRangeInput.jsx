import React from 'react';
import PropTypes from 'prop-types';
import c from 'classnames';
import * as R from 'ramda';

import {clamp} from '@pkg/gl-math';

import {withInputs} from '@pkg/basic-hooks/src/inputs/useInputs';
import {injectClassesStylesheet} from '@pkg/fast-stylesheet/src/react';

import {Flex} from '@ui/basic-components/styled';
import GameButton from './GameButton';
import GameInput from './GameInput';

const GameRangeInput = ({min, max, classes, className, l, value}) => (
  <Flex
    direction='row'
    className={c(
      classes.base,
      className,
    )}
  >
    <GameButton
      className={classes.button}
      size='tiny'
      type='red'
      onClick={
        () => l.setValue(
          clamp(min, max, (value || min) - 1),
        )
      }
    >
      <span>-</span>
    </GameButton>

    <GameInput
      className={classes.input}
      size='tiny'
      type='number'
      min={min}
      max={max}
      {...l.input()}
    />

    <GameButton
      className={classes.button}
      size='tiny'
      type='red'
      onClick={
        () => l.setValue(
          clamp(min, max, (value || min) + 1),
        )
      }
    >
      <span>+</span>
    </GameButton>
  </Flex>
);

GameRangeInput.displayName = 'GameRangeInput';

GameRangeInput.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
};

GameRangeInput.defaultProps = {
  min: 1,
  max: 4,
};

export default R.compose(
  React.memo,
  injectClassesStylesheet(
    {
      base: {},

      button: {
        flexShrink: 0,
        padding: 0,
        width: 32,
        height: 32,

        '& > span': {
          fontSize: '25px',
        },
      },

      input: {
        margin: [0, 10],
        flexGrow: '1',
        textAlign: 'center',
        '-moz-appearance': 'textfield',

        '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
          '-webkit-appearance': 'none',
          margin: 0,
        },
      },
    },
    {
      index: 5,
    },
  ),
  withInputs,
)(GameRangeInput);
