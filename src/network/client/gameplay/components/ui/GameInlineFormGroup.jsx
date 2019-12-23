import React from 'react';

import {styled} from '@pkg/fast-stylesheet/src/react';
import GameLabel from './GameLabel';

const InlineFormGroupWrapper = styled.div(
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',

    '&:not(:last-child)': {
      marginBottom: 10,
    },

    '& > *:first-child': {
      position: 'relative',
      top: -2,
    },
  },
);

const GameInlineFormGroup = ({input, label, ...props}) => (
  <InlineFormGroupWrapper {...props}>
    <GameLabel
      right={2}
      bottom={0}
    >
      {label}
    </GameLabel>

    {input}
  </InlineFormGroupWrapper>
);

GameInlineFormGroup.displayName = 'GameInlineFormGroup';

export default GameInlineFormGroup;
