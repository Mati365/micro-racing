import React from 'react';
import PropTypes from 'prop-types';

import plusIconUrl from '@game/res/img/icons/plus.png';

import {useI18n} from '@ui/i18n';
import {usePromiseCallback} from '@pkg/basic-hooks';

import {GameClickableIconCard} from '../../components/ui';

const CreateRoomCard = ({createRoom}) => {
  const t = useI18n('game.screens.rooms_list');
  const [_createRoom, {loading}] = usePromiseCallback(createRoom);

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
      onClick={_createRoom}
    />
  );
};

CreateRoomCard.displayName = 'CreateRoomCard';

CreateRoomCard.propTypes = {
  createRoom: PropTypes.func.isRequired,
};

export default React.memo(CreateRoomCard);
