import React from 'react';

import {
  Text,
  Margin,
} from '@ui/basic-components/styled';

const GameLabel = ({children, spaceBottom = 2, spaceTop, textProps, centered, ...props}) => (
  <Margin
    top={spaceTop}
    bottom={spaceBottom}
    block={centered}
    {...props}
  >
    <Text
      size='small'
      type='dim_gray'
      {...centered && {
        expanded: true,
        align: 'center',
      }}
      {...textProps}
    >
      {children}
    </Text>
  </Margin>
);

export default GameLabel;
