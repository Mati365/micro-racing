import React from 'react';
import * as R from 'ramda';

import {useI18n} from '@ui/i18n';
import {useLowLatencyObservable} from '@pkg/basic-hooks';

import TitledPlayersList from '../PlayersListConfig/TitledPlayersList';
import UnkickPlayerListItem from './UnkickPlayerListItem';
import {GameLabel} from '../../../components/ui';

const KickedPlayersConfig = ({gameBoard}) => {
  const t = useI18n('game.screens.room_edit.banned_list');
  const bannedPlyers = useLowLatencyObservable(
    {
      observable: gameBoard.observers.bannedPlayers,
    },
  );

  const onUnban = player => gameBoard.client.unbanPlayer({id: player.id});

  if (R.isEmpty(bannedPlyers)) {
    return (
      <GameLabel
        centered
        spaceTop={0}
        spaceBottom={0}
      >
        {t('no_banned')}
      </GameLabel>
    );
  }

  return (
    <TitledPlayersList
      gameBoard={gameBoard}
      title={t('list_title')}
      list={bannedPlyers || []}
      listItem={UnkickPlayerListItem}
      listItemProps={{
        onUnban,
      }}
    />
  );
};

KickedPlayersConfig.displayName = 'KickedPlayersConfig';

export default React.memo(KickedPlayersConfig);
