import {DARKEST_GRAY} from '@ui/colors';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {BlankInput} from '@ui/basic-components/styled';

const GameInput = styled(
  BlankInput,
  {
    base: {
      borderRadius: 7,
      border: `1px solid ${DARKEST_GRAY}`,
      color: '#929292',
      padding: 7,
      textTransform: 'uppercase',
      fontWeight: 900,
    },

    expanded: {
      width: '100%',
    },
  },
  {
    index: 3,
    omitProps: ['type', 'expanded'],
    classSelector: (classes, {type, expanded}) => [
      classes[`type-${type}`],
      expanded && classes.expanded,
    ],
  },
);

GameInput.displayName = 'GameInput';

export default GameInput;
