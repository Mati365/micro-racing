import React from 'react';
import PropTypes from 'prop-types';
import {useHistory} from 'react-router-dom';

import plusIconUrl from '@game/res/img/icons/plus.png';

import usePromiseCallback from '@ui/basic-hooks/async/usePromiseCallback';
import {useI18n} from '@ui/i18n';

import {GameClickableIconCard} from '../../components/ui';
import PlayerClientSocket from '../../../protocol/PlayerClientSocket';

const CreateRoomCard = ({client}) => {
  const t = useI18n('game.screens.rooms_list');
  const history = useHistory();
  const [createRoom, {loading}] = usePromiseCallback(
    async () => {
      const room = await client.joinRoom();
      history.push(
        '/room-edit',
        {
          room,
        },
      );
    },
  );

  return (
    <GameClickableIconCard
      disabled={loading}
      icon={(
        <img
          src={plusIconUrl}
          alt='Plus'
        />
      )}
      title={
        t(loading ? 'creating_room' : 'create_room')
      }
      onClick={createRoom}
    />
  );
};

CreateRoomCard.displayName = 'CreateRoomCard';

CreateRoomCard.propTypes = {
  client: PropTypes.instanceOf(PlayerClientSocket).isRequired,
};

export default React.memo(CreateRoomCard);
