import ReactDOM from 'react-dom';
import React from 'react';

import PlayerClientSocket from '@game/network/client/PlayerClientSocket';
import GameCanvas from './ui/GameCanvas';

(async () => {
  const client = await PlayerClientSocket.connect('ws://lvh.me:8080');
  client.joinRoom('general');
})();

ReactDOM.render(
  <GameCanvas
    dimensions={{
      w: 800,
      h: 600,
    }}
  />,
  document.getElementById('app-root'),
);
