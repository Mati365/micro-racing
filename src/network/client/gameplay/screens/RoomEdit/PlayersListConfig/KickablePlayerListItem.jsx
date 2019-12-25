import React from 'react';

import {AsyncLockButton} from '@ui/basic-components';
import {GameButton} from '../../../components/ui';
import PlayerListItem from './PlayerListItem';

const KickablePlayerListItem = ({current, buttons, onKick, onBan, ...props}) => (
  <PlayerListItem
    {...props}
    current={current}
    buttons={(
      !current && (
        <>
          <AsyncLockButton
            component={GameButton}
            type='green'
            size='tiny'
            onClick={() => onKick(props.player)}
          >
            Kick
          </AsyncLockButton>

          <AsyncLockButton
            component={GameButton}
            type='red'
            size='tiny'
            onClick={() => onBan(props.player)}
          >
            Ban
          </AsyncLockButton>
        </>
      )
    )}
  />
);

KickablePlayerListItem.displayName = 'KickablePlayerListItem';

export default KickablePlayerListItem;
