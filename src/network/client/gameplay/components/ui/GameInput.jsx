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
      fontWeight: 900,
    },

    uppercase: {
      textTransform: 'uppercase',
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
    omitProps: ['expanded', 'size', 'uppercase'],
    classSelector: (classes, {expanded, size, uppercase}) => [
      size && classes[`size-${size}`],
      expanded && classes.expanded,
      uppercase && classes.uppercase,
    ],
  },
);

GameInput.displayName = 'GameInput';

GameInput.propTypes = {
  size: PropTypes.string,
  uppercase: PropTypes.bool,
};

GameInput.defaultProps = {
  size: null,
  uppercase: true,
};

export default GameInput;
