import React from 'react';
import PropTypes from 'prop-types';
import c from 'classnames';

import {clamp} from '@pkg/gl-math';

import {useInputs} from '@pkg/basic-hooks';
import {injectClassesStylesheet} from '@pkg/fast-stylesheet/src/react';

import {Flex} from '@ui/basic-components/styled';
import GameButton from './GameButton';
import GameInput from './GameInput';

const GameRangeInput = ({min, max, classes, className, value, onChange}) => {
  const {l, setValue} = useInputs(
    {
      value,
      onChange,
    },
  );

  return (
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
          () => setValue(
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
          () => setValue(
            clamp(min, max, (value || min) + 1)
          )
        }
      >
        <span>+</span>
      </GameButton>
    </Flex>
  );
};

GameRangeInput.displayName = 'GameRangeInput';

GameRangeInput.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
};

GameRangeInput.defaultProps = {
  min: 1,
  max: 4,
};

export default React.memo(
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
        maxWidth: 'calc(100% - 84px)',
        textAlign: 'center',
      },
    },
    {
      index: 5,
    },
  )(GameRangeInput),
);
