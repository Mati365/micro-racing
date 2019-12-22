import React from 'react';
import * as R from 'ramda';

// import {useI18n} from '@ui/i18n';
import {useLowLatencyObservable} from '@pkg/basic-hooks';
import {useI18n} from '@ui/i18n';

import {
  Text,
  UnorderedList,
} from '@ui/basic-components/styled';

import PlayerListItem from './PlayerListItem';

const pluckPlayersArray = R.compose(
  R.pluck('player'),
  R.values,
  R.prop('nodes'),
);

const PlayersUnorderedList = ({title, players, spaced, gameBoard, onKick}) => {
  if (!players || !players.length)
    return null;

  return (
    <>
      <Text
        size='small'
        type='dim_gray'
        {...spaced && {
          style: {
            marginTop: 15,
          },
        }}
      >
        {title}
      </Text>

      <UnorderedList>
        {players.map(
          (player) => {
            const {ownerID} = gameBoard.roomInfo;

            return (
              <PlayerListItem
                key={player.id}
                op={ownerID}
                current={
                  gameBoard.client.info.id === player.id
                }
                player={player}
                onKick={() => onKick(player)}
              />
            );
          },
        )}
      </UnorderedList>
    </>
  );
};

const PlayersListConfig = ({gameBoard}) => {
  const t = useI18n('game.screens.room_edit.players_list');
  const players = useLowLatencyObservable(
    {
      observable: gameBoard.observers.players,
      parserFn: pluckPlayersArray,
    },
  ) || [];

  const roomInfo = useLowLatencyObservable(
    {
      observable: gameBoard.observers.roomInfo,
    },
  );

  const groupedPlayers = R.groupBy(
    (player) => {
      if (player.id === roomInfo?.ownerID)
        return 'op';

      return 'inRace';
    },
    players,
  );

  const onKick = player => gameBoard.client.kickPlayer(player.id);

  return (
    <>
      <PlayersUnorderedList
        title={t('ops')}
        players={groupedPlayers.op || []}
        gameBoard={gameBoard}
        onKick={onKick}
      />

      <PlayersUnorderedList
        title={t('in_race')}
        players={groupedPlayers.inRace || []}
        gameBoard={gameBoard}
        onKick={onKick}
        spaced
      />
    </>
  );
};

PlayersListConfig.displayName = 'PlayersListConfig';

export default React.memo(PlayersListConfig);
