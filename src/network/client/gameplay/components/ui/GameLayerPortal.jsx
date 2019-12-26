import React from 'react';

import {BLACK} from '@ui/colors';

import {styled} from '@pkg/fast-stylesheet/src/react';

import {Layer} from '@ui/basic-components/styled';
import {Portal} from '@ui/basic-components';

const GAME_PORTAL_HOLDER_TAG = 'game-portal-holder';

const queryGamePortal = () => document.querySelector(GAME_PORTAL_HOLDER_TAG) || document.body;

const GamePortalLayer = styled(
  Layer,
  {
    base: {
      background: 'rgba(0, 0, 0, 0.25)',
      flexDirection: 'column',
    },

    black: {
      background: BLACK,
    },
  },
  {
    omitProps: ['black'],
    classSelector: (classes, {black}) => black && classes.black,
  },
);

export const GamePortalHolder = () => {
  const Tag = GAME_PORTAL_HOLDER_TAG;

  return (
    <Tag />
  );
};

const GameLayerPortal = props => (
  <Portal portalParentSelector={queryGamePortal}>
    <GamePortalLayer {...props} />
  </Portal>
);

GameLayerPortal.displayName = 'GameLayerPortal';

export default GameLayerPortal;
