import React from 'react';

import {PLAYER_TYPES} from '@game/network/constants/serverCodes';

import {AsyncLockButton} from '@ui/basic-components';
import {GameButton} from '../../../components/ui';
import PlayerListItem from './PlayerListItem';

const KickablePlayerListItem = ({current, currentOp, buttons, onKick, onBan, ...props}) => {
  const {player} = props;

  return (
    <PlayerListItem
      {...props}
      current={current}
      buttons={(
        !current && currentOp && (
          <>
            <AsyncLockButton
              component={GameButton}
              type='green'
              size='tiny'
              onClick={() => onKick(props.player)}
            >
              Kick
            </AsyncLockButton>

            {player.kind !== PLAYER_TYPES.BOT && (
              <AsyncLockButton
                component={GameButton}
                type='red'
                size='tiny'
                onClick={() => onBan(props.player)}
              >
                Ban
              </AsyncLockButton>
            )}
          </>
        )
      )}
    />
  );
};

KickablePlayerListItem.displayName = 'KickablePlayerListItem';

export default KickablePlayerListItem;
