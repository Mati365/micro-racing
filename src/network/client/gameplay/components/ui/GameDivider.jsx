import PropTypes from 'prop-types';

import {DARKEST_GRAY} from '@ui/colors';
import {styled} from '@pkg/fast-stylesheet/src/react';

export const dividerStyles = {
  base: {
    padding: 0,
    border: 0,
    outline: 0,
  },

  none: {margin: 0},
  small: {margin: 10},
  'medium-small': {margin: 20},
  medium: {margin: 30},
  big: {margin: 40},
  huge: {margin: 50},

  'type-dashed': {borderStyle: 'dashed !important'},

  horizontal: {
    width: '100%',
    marginLeft: 0,
    marginRight: 0,
    borderTop: `1px solid ${DARKEST_GRAY}`,
  },

  vertical: {
    width: 1,
    height: '100%',
    marginTop: 0,
    marginBottom: 0,
    borderLeft: `1px solid ${DARKEST_GRAY}`,
  },
};

const GameDivider = styled(
  'hr',
  dividerStyles,
  {
    omitProps: ['vertical', 'spacing', 'type'],
    classSelector: (classes, {vertical, spacing, type}) => [
      classes[spacing],
      classes[vertical ? 'vertical' : 'horizontal'],
      type && classes[`type-${type}`],
    ],
  },
);

GameDivider.displayName = 'GameDivider';

GameDivider.propTypes = {
  vertical: PropTypes.bool,
  type: PropTypes.string,
  spacing: PropTypes.oneOf([
    'none',
    'medium-small',
    'medium',
    'small',
    'big',
    'huge',
  ]),
};

GameDivider.defaultProps = {
  vertical: false,
  spacing: 'small',
  type: 'dashed',
};

export default GameDivider;
