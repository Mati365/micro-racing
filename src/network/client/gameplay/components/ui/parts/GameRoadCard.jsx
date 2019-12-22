import React from 'react';
import PropTypes from 'prop-types';

import {ID_SCHEMA} from '@ui/schemas';
import GameClickableIconCard from '../GameClickableIconCard';

const GameRoadCard = ({road, ...props}) => (
  <GameClickableIconCard
    size='small'
    iconSize='medium-big'
    icon={(
      <img
        alt='road'
        src={road.thumbnail}
      />
    )}
    title={road.title}
    {...props}
  />
);

GameRoadCard.displayName = 'GameRoadCard';

GameRoadCard.propTypes = {
  road: PropTypes.shape(
    {
      id: ID_SCHEMA,
      title: PropTypes.string.isRequired,
      thumbnail: PropTypes.string.isRequired,
    },
  ).isRequired,
};

export default GameRoadCard;
