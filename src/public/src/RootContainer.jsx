import React from 'react';

import GameCanvas from '@game/network/client/gameplay/GameCanvas';

const RootContainer = () => (
  <GameCanvas
    dimensions={{
      w: 800,
      h: 600,
    }}
  />
);

RootContainer.displayName = 'RootContainer';

export default RootContainer;
