import React from 'react';
import PropTypes from 'prop-types';

import {styled} from '@pkg/fast-stylesheet/src/react';

import {useIntervalResourceFetch} from '@pkg/basic-hooks';
import {useI18n} from '@ui/i18n';

import PlayerClientSocket from '../../../protocol/PlayerClientSocket';
import CreateRoomCard from './CreateRoomCard';
import {
  GameHeader,
  GameDivider,
} from '../../components/ui';

const ListWrapper = styled.div(
  {
    width: 800,
    maxWidth: '90vw',
  },
);

const ServersList = ({client}) => {
  const t = useI18n('game.screens.rooms_list');
  const {loading, result} = useIntervalResourceFetch(
    {
      fetchFn: ::client.fetchRoomsList,
    },
  );

  console.log(loading, result);

  return (
    <ListWrapper>
      <GameHeader spaced={false}>
        {t('header')}
      </GameHeader>

      <GameDivider spacing='medium-small' />

      <CreateRoomCard />
    </ListWrapper>
  );
};

ServersList.displayName = 'ServersList';

ServersList.propTypes = {
  client: PropTypes.instanceOf(PlayerClientSocket).isRequired,
};

export default React.memo(ServersList);
