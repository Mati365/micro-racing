import React from 'react';
import PropTypes from 'prop-types';

import {ID_SCHEMA} from '@ui/schemas';
import GameClickableIconCard from '../GameClickableIconCard';

export const ROAD_CARD_INFO_SCHEMA = PropTypes.shape(
  {
    id: ID_SCHEMA,
    title: PropTypes.string.isRequired,
    thumbnail: PropTypes.string.isRequired,
  },
);

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
  road: ROAD_CARD_INFO_SCHEMA.isRequired,
};

export default GameRoadCard;
