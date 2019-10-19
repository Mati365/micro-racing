import React from 'react';

import {WHITE} from '@ui/colors';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {
  TextButton,
  UnorderedList,
} from '@ui/basic-components/styled';

const ToolbarHolder = styled(
  UnorderedList,
  {
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: 5,

    '& button': {
      color: WHITE,
    },
  },
);

const Toolbar = () => (
  <ToolbarHolder>
    <li>
      <TextButton>
        AA
      </TextButton>
    </li>
  </ToolbarHolder>
);

Toolbar.displayName = 'Toolbar';

export default Toolbar;
