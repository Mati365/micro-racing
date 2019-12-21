import React from 'react';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {
  GameHeader,
  GameDivider,
} from '../components/ui';

const ScreenHolder = styled.div(
  {
    width: 800,
    height: '90vh',
    maxWidth: '90vw',
    overflowY: 'auto',
  },
);

const TitledScreen = ({header, children}) => (
  <ScreenHolder>
    <GameHeader spaced={false}>
      {header}
    </GameHeader>

    <GameDivider spacing='medium-small' />

    {children}
  </ScreenHolder>
);

TitledScreen.displayName = 'TitledScreen';

export default TitledScreen;
