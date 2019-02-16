import ReactDOM from 'react-dom';
import React from 'react';

import GameCanvas from './ui/GameCanvas';

ReactDOM.render(
  <GameCanvas
    dimensions={{
      w: 640,
      h: 640,
    }}
  />,
  document.getElementById('app-root'),
);
