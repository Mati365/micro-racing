import React from 'react';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {UnorderedList} from '@ui/basic-components/styled';

const ListWrapper = ({children, ...props}) => (
  <UnorderedList {...props}>
    {React.Children.map(
      children,
      child => (
        <li>
          {child}
        </li>
      ),
    )}
  </UnorderedList>
);

const GameButtonsList = styled(
  ListWrapper,
  {
    '& li': {
      marginRight: 10,
    },
  },
  {
    props: {
      row: true,
    },
  },
);

export default GameButtonsList;
