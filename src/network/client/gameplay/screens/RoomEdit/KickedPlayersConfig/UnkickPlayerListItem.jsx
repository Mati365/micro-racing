import React from 'react';

import {useI18n} from '@ui/i18n';

import {AsyncLockButton} from '@ui/basic-components';
import {GameButton} from '../../../components/ui';
import PlayerListItem from '../PlayersListConfig/PlayerListItem';

const UnkickPlayerListItem = ({buttons, currentOp, onUnban, ...props}) => {
  const t = useI18n('game.screens.room_edit');

  return (
    <PlayerListItem
      {...props}
      buttons={
        currentOp && (
          <AsyncLockButton
            component={GameButton}
            type='red'
            size='tiny'
            onClick={() => onUnban(props.player)}
          >
            {t('banned_list.unban')}
          </AsyncLockButton>
        )
      }
    />
  );
};

UnkickPlayerListItem.displayName = 'UnkickPlayerListItem';

export default UnkickPlayerListItem;
