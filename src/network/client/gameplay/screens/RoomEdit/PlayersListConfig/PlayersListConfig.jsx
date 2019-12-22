import React from 'react';
import * as R from 'ramda';

// import {useI18n} from '@ui/i18n';
import {useLowLatencyObservable} from '@pkg/basic-hooks';
import {useI18n} from '@ui/i18n';

import {UnorderedList} from '@ui/basic-components/styled';
import {GameLabel} from '../../../components/ui';
import PlayerListItem from './PlayerListItem';

const pluckPlayersArray = R.compose(
  R.pluck('player'),
  R.values,
  R.prop('nodes'),
);

const PlayersUnorderedList = ({
  title, players, spaced, gameBoard,
  onKick, onBan,
}) => {
  if (!players || !players.length)
    return null;

  return (
    <>
      <GameLabel
        spaceTop={spaced ? 2 : 0}
        spaceBottom={0}
      >
        {title}
      </GameLabel>

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
                onBan={() => onBan(player)}
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

  const sharedProps = {
    onKick: player => gameBoard.client.kickPlayer({id: player.id}),
    onBan: player => gameBoard.client.kickPlayer({id: player.id, ban: true}),
  };

  return (
    <>
      <PlayersUnorderedList
        title={t('ops')}
        players={groupedPlayers.op || []}
        gameBoard={gameBoard}
        {...sharedProps}
      />

      <PlayersUnorderedList
        title={t('in_race')}
        players={groupedPlayers.inRace || []}
        gameBoard={gameBoard}
        spaced
        {...sharedProps}
      />
    </>
  );
};

PlayersListConfig.displayName = 'PlayersListConfig';

export default React.memo(PlayersListConfig);
