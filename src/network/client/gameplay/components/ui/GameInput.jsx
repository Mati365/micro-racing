import PropTypes from 'prop-types';

import {
  BLACK,
  DARKEST_GRAY,
} from '@ui/colors';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {BlankInput} from '@ui/basic-components/styled';

const GameInput = styled(
  BlankInput,
  {
    base: {
      background: BLACK,
      borderRadius: 7,
      border: `2px solid ${DARKEST_GRAY}`,
      color: '#929292',
      padding: 7,
      textTransform: 'uppercase',
      fontWeight: 900,
    },

    'size-small': {
      padding: 4,
      borderWidth: 1,
    },

    expanded: {
      width: '100%',
    },
  },
  {
    index: 3,
    omitProps: ['type', 'expanded', 'size'],
    classSelector: (classes, {type, expanded, size}) => [
      classes[`type-${type}`],
      size && classes[`size-${size}`],
      expanded && classes.expanded,
    ],
  },
);

GameInput.displayName = 'GameInput';

GameInput.propTypes = {
  size: PropTypes.string,
};

GameInput.defaultProps = {
  size: null,
};

export default GameInput;
