import {
  DARKEST_GRAY,
  WHITE_DARKEN_5,
  WHITE,
} from '@ui/colors';

import {styled} from '@pkg/fast-stylesheet/src/react';

const GameTable = styled.table(
  {
    width: '100%',
    color: WHITE,
    textAlign: 'center',
    borderCollapse: 'collapse',

    '&, & th, & td': {
      border: `1px dashed ${DARKEST_GRAY}`,
    },

    '& th, & td': {
      padding: [8, 5],
    },

    '& th': {
      textTransform: 'uppercase',
      fontSize: '11px',
      fontWeight: 900,
      color: WHITE_DARKEN_5,
    },

    '& td': {
      fontSize: '12px',
      fontWeight: 600,
    },
  },
);

export default GameTable;
