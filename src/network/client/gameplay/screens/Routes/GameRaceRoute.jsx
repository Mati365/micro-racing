import React from 'react';
import GameCanvas from '../Racing';

const GameRaceRoute = ({gameBoard}) => (
  <GameCanvas gameBoard={gameBoard} />
);

GameRaceRoute.displayName = 'GameRaceRoute';

export default React.memo(GameRaceRoute);
