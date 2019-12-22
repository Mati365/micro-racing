import React from 'react';
import PropTypes from 'prop-types';

import {ID_SCHEMA} from '@ui/schemas';

import {Margin} from '@ui/basic-components/styled';

import {ROAD_CARD_INFO_SCHEMA} from './GameRoadCard';
import GameClickableIconCard from '../GameClickableIconCard';

const GameRoomCard = ({room: {name, map, playersCount, config}, ...props}) => (
  <GameClickableIconCard
    size='small'
    iconWrapperProps={{
      style: {
        alignSelf: 'flex-start',
        marginTop: 10,
      },
    }}
    iconSize='medium-big'
    icon={(
      <img
        alt='road'
        src={map.thumbnail}
      />
    )}
    title={(
      <>
        {name}

        <Margin
          top={1}
          block
          style={{
            opacity: 0.5,
          }}
        >
          <span>Gracze: </span>
          <span>{`${playersCount} / ${config.playersLimit}`}</span>
        </Margin>
      </>
    )}
    {...props}
  />
);

GameRoomCard.displayName = 'GameRoadCard';

GameRoomCard.propTypes = {
  room: PropTypes.shape(
    {
      id: ID_SCHEMA,
      playersCount: PropTypes.number,
      name: PropTypes.string,
      map: ROAD_CARD_INFO_SCHEMA,
      config: PropTypes.shape(
        {
          playersLimit: PropTypes.number,
        },
      ),
    },
  ).isRequired,
};

export default GameRoomCard;
