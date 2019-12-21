import React from 'react';

import plusIconUrl from '@game/res/img/icons/plus.png';

import {useI18n} from '@ui/i18n';
import {GameClickableIconCard} from '../../components/ui';

const CreateRoomCard = () => {
  const t = useI18n('game.screens.rooms_list');

  return (
    <GameClickableIconCard
      icon={(
        <img
          src={plusIconUrl}
          alt='Plus'
        />
      )}
      title={
        t('create_room')
      }
    />
  );
};

CreateRoomCard.displayName = 'CreateRoomCard';

export default CreateRoomCard;
