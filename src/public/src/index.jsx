import ReactDOM from 'react-dom';
import React from 'react';

import GameCanvas from './ui/GameCanvas';

ReactDOM.render(
  <GameCanvas
    dimensions={{
      w: 640,
      h: 480,
    }}
  />,
  document.getElementById('app-root'),
);
