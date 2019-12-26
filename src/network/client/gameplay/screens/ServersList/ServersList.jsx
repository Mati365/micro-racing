import React from 'react';
import PropTypes from 'prop-types';
import {useHistory} from 'react-router-dom';

import {useI18n} from '@ui/i18n';
import {
  usePromiseCallback,
  useIntervalResourceFetch,
} from '@pkg/basic-hooks';

import PlayerClientSocket from '../../../protocol/PlayerClientSocket';

import {GameRoomCard, GameCardsList} from '../../components/ui';
import CreateRoomCard from './CreateRoomCard';
import TitledScreen from '../TitledScreen';
import GameBoard from '../../states/GameBoard';

const ServersList = ({client}) => {
  const history = useHistory();
  const t = useI18n('game.screens.rooms_list');
  const {result: rooms} = useIntervalResourceFetch(
    {
      fetchFn: ::client.fetchRoomsList,
    },
  );

  const [joinRoom, {loading}] = usePromiseCallback(
    async (id) => {
      const gameBoard = new GameBoard(
        {
          client,
        },
      );

      await gameBoard.loadInitialRoomState(
        await client.joinRoom(id),
      );

      history.push(
        '/config/room-edit',
        {
          gameBoard,
        },
      );
    },
  );

  return (
    <TitledScreen header={t('header')}>
      <GameCardsList
        {...loading && {
          pointerEvents: 'none',
        }}
      >
        <li>
          <CreateRoomCard createRoom={() => joinRoom()} />
        </li>

        {(rooms?.list || []).map(room => (
          <li key={room.id}>
            <GameRoomCard
              size='medium'
              key={room.id}
              room={room}
              mutedTitle={false}
              onClick={
                () => joinRoom(room.id)
              }
            />
          </li>
        ))}
      </GameCardsList>
    </TitledScreen>
  );
};

ServersList.displayName = 'ServersList';

ServersList.propTypes = {
  client: PropTypes.instanceOf(PlayerClientSocket).isRequired,
};

export default React.memo(ServersList);
