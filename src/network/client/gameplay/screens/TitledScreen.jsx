import React from 'react';
import PropTypes from 'prop-types';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {
  GameHeader,
  GameDivider,
} from '../components/ui';

export const ScreenHolder = styled.div(
  {
    base: {
      height: '90vh',
    },

    expanded: {
      width: 800,
      maxWidth: '90vw',
    },
  },
  {
    omitProps: ['expanded'],
    classSelector: (classes, {expanded}) => expanded && classes.expanded,
  },
);

ScreenHolder.propTypes = {
  expanded: PropTypes.bool,
};

ScreenHolder.defaultProps = {
  expanded: true,
};

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