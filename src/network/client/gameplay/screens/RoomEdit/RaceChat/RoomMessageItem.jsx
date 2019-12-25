import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {WHITE} from '@ui/colors';

import {injectClassesStylesheet} from '@pkg/fast-stylesheet/src/react';
import {capitalize} from '@pkg/basic-helpers';

import {GameLabel} from '../../../components/ui';

const styles = {
  base: {
    color: WHITE,
    lineHeight: '15px',

    '&, & > *': {
      fontSize: '10px',
    },
  },

  muted: {
    opacity: 0.5,
  },
};

const RoomMessageItem = ({
  classes,
  roomMessage: {
    content: {
      muted,
      nick,
      color,
      contentColor,
      message,
    },
  },
}) => (
  <li
    className={c(
      classes.base,
      muted && classes.muted,
    )}
  >
    <GameLabel
      spaceBottom={0}
      right={1}
      textProps={{
        style: {
          ...color && {
            color,
          },
        },
      }}
    >
      {`[${capitalize(nick)}]: `}
    </GameLabel>
    {(
      contentColor
        ? <span style={{color: contentColor}}>{message}</span>
        : message
    )}
  </li>
);

RoomMessageItem.displayName = 'RoomMessageItem';

export default R.compose(
  React.memo,
  injectClassesStylesheet(
    styles,
    {
      index: 5,
    },
  ),
)(RoomMessageItem);
