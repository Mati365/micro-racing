import React from 'react';

import * as COLORS from '@ui/colors';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {Layer} from '@ui/basic-components/styled';

export const OverlayTitle = styled.span(
  {
    color: COLORS.WHITE,
    textShadow: '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
    fontWeight: 'bold',
  },
);

OverlayTitle.displayName = 'OverlayTitle';

const TitledOverlay = ({children}) => (
  <Layer>
    <OverlayTitle>
      {children}
    </OverlayTitle>
  </Layer>
);

TitledOverlay.displayName = 'TitledOverlay';

export default React.memo(TitledOverlay);
