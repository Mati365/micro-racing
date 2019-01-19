import ReactDOM from 'react-dom';
import React from 'react';

import GameCanvas from './ui/GameCanvas';

ReactDOM.render(
  <GameCanvas
    dimensions={{
      width: 640,
      height: 480,
    }}
  />,
  document.getElementById('app-root'),
);
