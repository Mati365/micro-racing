import React from 'react';

import {DARKEST_GRAY} from '@ui/colors';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {Layer} from '@ui/basic-components/styled';

const GameCardHolder = styled.div(
  {
    base: {
      borderRadius: 4,
      border: `1px dashed ${DARKEST_GRAY}`,
    },

    square: {
      position: 'relative',
      height: 0,
      paddingBottom: '100%',
    },
  },
  {
    index: 3,
    omitProps: ['type', 'square'],
    classSelector: (classes, {type, square}) => [
      classes[`type-${type}`],
      square && classes.square,
    ],
  },
);

const GameCard = ({children, ...props}) => (
  <GameCardHolder {...props}>
    <Layer>
      {children}
    </Layer>
  </GameCardHolder>
);

GameCard.displayName = 'GameCard';

export default GameCard;
