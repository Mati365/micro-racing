import React from 'react';
import * as R from 'ramda';

import sendIconUrl from '@game/res/img/icons/send-o-black.png';

import {useI18n} from '@ui/i18n';
import {useInputs} from '@ui/basic-hooks';

import {injectClassesStylesheet} from '@pkg/fast-stylesheet/src/react';

import {Flex} from '@ui/basic-components/styled';
import {AsyncLockButton} from '@ui/basic-components';

import {
  GameInput,
  GameIconButton,
} from '../../../components/ui';

const styles = {
  base: {
    '& > input, button': {
      height: 25,
    },
  },

  input: {
    width: '100%',
    fontSize: '10px',
    fontWeight: 'initial',
  },

  button: {
    marginLeft: 10,
  },
};

const RaceChatMessageBox = ({classes, onSendMessage}) => {
  const t = useI18n('game.screens.chat');
  const {l, value} = useInputs();
  const title = t('send');

  const sendMessage = () => {
    if (!value || value.length > 100)
      return false;

    l.setValue('');
    return onSendMessage(
      {
        message: R.trim(l.value),
      },
    );
  };

  return (
    <Flex
      direction='row'
      className={classes.base}
    >
      <GameInput
        className={classes.input}
        size='small'
        placeholder={
          t('type_message')
        }
        uppercase={false}
        {...l.input()}
        onKeyDown={(e) => {
          // enter
          if (e.keyCode === 13) {
            sendMessage();
            e.preventDefault();
          }
        }}
      />

      <AsyncLockButton
        component={GameIconButton}
        icon={(
          <img
            src={sendIconUrl}
            alt={title}
            style={{
              position: 'relative',
              top: 1,
              right: 1,
            }}
          />
        )}
        disabled={!value?.length}
        className={classes.button}
        title={title}
        size='tiny'
        type='white'
        onClick={sendMessage}
      />
    </Flex>
  );
};

RaceChatMessageBox.displayName = 'RaceChatMessageBox';

export default R.compose(
  React.memo,
  injectClassesStylesheet(
    styles,
    {
      index: 6,
    },
  ),
)(RaceChatMessageBox);
