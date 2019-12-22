import React from 'react';
import c from 'classnames';

import {WHITE} from '@ui/colors';

import carIconUrl from '@game/res/img/icons/car.png';
import {injectClassesStylesheet} from '@pkg/fast-stylesheet/src/react';

import {AsyncLockButton} from '@ui/basic-components';
import {GameButton} from '../../../components/ui';

const PlayerListItem = ({player, current, classes, op, onKick, ...props}) => (
  <li
    {...props}
    className={c(
      classes.base,
      current && classes.current,
    )}
  >
    <img
      alt='Car'
      src={carIconUrl}
      className={classes.icon}
    />
    <span
      className={c(
        classes.nick,
        !current && classes.mutedNick,
      )}
    >
      {player.nick}
    </span>

    {!current && (
      <AsyncLockButton
        component={GameButton}
        type='red'
        size='tiny'
        className={classes.toolbarButton}
        onClick={onKick}
      >
        Kick
      </AsyncLockButton>
    )}
  </li>
);

PlayerListItem.displayName = 'PlayerListItem';

export default injectClassesStylesheet(
  {
    base: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',

      color: WHITE,
      fontSize: 10,
      textTransform: 'uppercase',
    },

    icon: {
      display: 'inline-block',
      width: 16,
      marginRight: 8,
      opacity: 0.3,
    },

    current: {
      fontWeight: 900,
    },

    nick: {
      position: 'relative',
      top: 1,
      paddingRight: 10,
    },

    toolbarButton: {
      marginLeft: 'auto',
    },

    mutedNick: {
      opacity: 0.5,
    },
  },
  {
    index: 5,
  },
)(PlayerListItem);
