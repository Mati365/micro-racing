import React from 'react';
import * as R from 'ramda';

import {WHITE} from '@ui/colors';

import {injectClassesStylesheet} from '@pkg/fast-stylesheet/src/react';
import {GameLabel} from '../../../components/ui';

const styles = {
  base: {
    color: WHITE,
    lineHeight: '15px',

    '&, & > *': {
      fontSize: '10px',
    },
  },
};

const RoomMessageItem = ({
  classes,
  roomMessage: {
    content: {
      nick,
      color,
      contentColor,
      message,
    },
  },
}) => (
  <li className={classes.base}>
    <GameLabel
      spaceBottom={0}
      right={1}
      textProps={
        color && {
          style: {
            color,
          },
        }
      }
    >
      {`[${nick}]: `}
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
