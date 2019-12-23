import React from 'react';

import {
  Text,
  Margin,
} from '@ui/basic-components/styled';

const GameLabel = ({children, spaceBottom = 2, spaceTop, ...props}) => (
  <Margin
    top={spaceTop}
    bottom={spaceBottom}
    {...props}
  >
    <Text
      size='small'
      type='dim_gray'
    >
      {children}
    </Text>
  </Margin>
);

export default GameLabel;
