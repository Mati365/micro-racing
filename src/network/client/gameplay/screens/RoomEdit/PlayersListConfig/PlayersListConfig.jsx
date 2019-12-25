import React from 'react';
import * as R from 'ramda';

import {useLowLatencyObservable} from '@pkg/basic-hooks';
import {useI18n} from '@ui/i18n';

import TitledPlayersList from './TitledPlayersList';

const pluckPlayersArray = R.compose(
  R.pluck('player'),
  R.values,
  R.prop('nodes'),
);

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
      <TitledPlayersList
        title={t('ops')}
        list={
          groupedPlayers.op || []
        }
        listItemProps={sharedProps}
        gameBoard={gameBoard}
      />

      <TitledPlayersList
        title={t('in_race')}
        list={
          groupedPlayers.inRace || []
        }
        listItemProps={sharedProps}
        gameBoard={gameBoard}
        spaced
      />
    </>
  );
};

PlayersListConfig.displayName = 'PlayersListConfig';

export default React.memo(PlayersListConfig);
