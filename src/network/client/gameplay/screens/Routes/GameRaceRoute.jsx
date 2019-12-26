import React from 'react';
import GameCanvas from '../GameCanvas';

const GameRaceRoute = ({gameBoard}) => (
  <GameCanvas gameBoard={gameBoard} />
);

GameRaceRoute.displayName = 'GameRaceRoute';

export default React.memo(GameRaceRoute);
