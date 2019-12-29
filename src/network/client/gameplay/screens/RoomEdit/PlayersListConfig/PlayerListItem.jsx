import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {WHITE} from '@ui/colors';

import carIconUrl from '@game/res/img/icons/car.png';
import {injectClassesStylesheet} from '@pkg/fast-stylesheet/src/react';
import textTruncateStyle from '@ui/basic-components/styled/styles/textTruncate';

const PlayerListItem = ({player, current, classes, buttons, ...props}) => (
  <li
    {...props}
    className={c(
      classes.base,
      current && classes.current,
      !R.isNil(buttons) && classes.withButtons,
    )}
  >
    <img
      alt='Car'
      src={carIconUrl}
      className={classes.icon}
    />
    <span
      title={player.nick}
      className={c(
        classes.nick,
        !current && classes.mutedNick,
      )}
    >
      {player.nick}
    </span>

    {!current && (
      <span className={classes.toolbarButton}>
        {buttons}
      </span>
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
      padding: [0, 5],

      color: WHITE,
      fontSize: 10,
      textTransform: 'uppercase',
    },

    withButtons: {
      marginBottom: 7,
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
      extend: textTruncateStyle,

      position: 'relative',
      top: 1,
      paddingRight: 10,
    },

    toolbarButton: {
      display: 'inherit',
      marginLeft: 'auto',

      '& > button:not(:last-of-type)': {
        marginRight: 5,
      },
    },

    mutedNick: {
      opacity: 0.5,
    },
  },
  {
    index: 5,
  },
)(PlayerListItem);
