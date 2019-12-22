import React from 'react';

import {
  Text,
  Margin,
} from '@ui/basic-components/styled';

const GameLabel = ({children, spaceBottom = 2, spaceTop}) => (
  <Margin
    top={spaceTop}
    bottom={spaceBottom}
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
