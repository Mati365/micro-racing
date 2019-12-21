import React from 'react';
import PropTypes from 'prop-types';

import {useIntervalResourceFetch} from '@pkg/basic-hooks';
import {useI18n} from '@ui/i18n';

import PlayerClientSocket from '../../../protocol/PlayerClientSocket';
import CreateRoomCard from './CreateRoomCard';
import TitledScreen from '../TitledScreen';

const ServersList = ({client}) => {
  const t = useI18n('game.screens.rooms_list');
  const {loading, result} = useIntervalResourceFetch(
    {
      fetchFn: ::client.fetchRoomsList,
    },
  );

  console.log(loading, result);

  return (
    <TitledScreen header={t('header')}>
      <CreateRoomCard client={client} />
    </TitledScreen>
  );
};

ServersList.displayName = 'ServersList';

ServersList.propTypes = {
  client: PropTypes.instanceOf(PlayerClientSocket).isRequired,
};

export default React.memo(ServersList);
