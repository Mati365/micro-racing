import ReactDOM from 'react-dom';
import React from 'react';

import GameCanvas from './ui/GameCanvas';

ReactDOM.render(
  <GameCanvas
    dimensions={{
      w: 800,
      h: 600,
    }}
  />,
  document.getElementById('app-root'),
);
