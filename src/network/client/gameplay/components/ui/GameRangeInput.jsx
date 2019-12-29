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

const GameRangeInput = ({
  disabled, min, max,
  classes, className, l, value,
}) => (
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
      disabled={disabled}
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
      size='small'
      type='number'
      min={min}
      max={max}
      disabled={disabled}
      {...l.input()}
    />

    <GameButton
      className={classes.button}
      size='tiny'
      type='red'
      disabled={disabled}
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
        width: 24,
        height: 24,
        lineHeight: '100%',

        '& > span': {
          fontSize: '20px',
        },
      },

      input: {
        width: 0,
        minWidth: 42,
        margin: [0, 10],
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
