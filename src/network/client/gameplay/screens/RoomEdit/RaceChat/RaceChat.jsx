import React, {useRef, useState, useMemo} from 'react';
import * as R from 'ramda';

import {
  ROOM_SERVER_MESSAGES_TYPES,
  ROOM_MESSAGE_TYPES,
  PLAYER_ACTIONS,
} from '@game/network/constants/serverCodes';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {reactFormat} from '@pkg/basic-helpers/base/format';
import {capitalize} from '@pkg/basic-helpers';

import {usePromise} from '@ui/basic-hooks';
import {useI18n} from '@ui/i18n';

import {
  Text,
  UnorderedList,
} from '@ui/basic-components/styled';

import RaceChatMessageBox from './RaceChatMessageBox';
import useClientChainListener from '../../../hooks/useClientChainListener';
import RoomMessageItem from './RoomMessageItem';

const processServerMessage = (t) => {
  const translations = t('server_messages');
  const formatNickMessage = (translation, styles) => ({color, nick}) => {
    const formattedMessage = reactFormat(
      translation,
      [
        <Text
          key='nick'
          style={{
            color,
          }}
          weight={800}
        >
          {capitalize(nick)}
        </Text>,
      ],
    );

    if (!styles)
      return formattedMessage;

    return (
      <span style={styles}>
        {formattedMessage}
      </span>
    );
  };

  const SERVER_MESSAGES_PARSER = {
    [ROOM_SERVER_MESSAGES_TYPES.PLAYER_CREATED_ROOM]: formatNickMessage(
      translations[ROOM_SERVER_MESSAGES_TYPES.PLAYER_CREATED_ROOM],
    ),

    [ROOM_SERVER_MESSAGES_TYPES.PLAYER_JOIN]: formatNickMessage(
      translations[ROOM_SERVER_MESSAGES_TYPES.PLAYER_JOIN],
    ),

    [ROOM_SERVER_MESSAGES_TYPES.PLAYER_LEFT]: formatNickMessage(
      translations[ROOM_SERVER_MESSAGES_TYPES.PLAYER_LEFT],
    ),

    [ROOM_SERVER_MESSAGES_TYPES.PLAYER_KICK]: formatNickMessage(
      translations[ROOM_SERVER_MESSAGES_TYPES.PLAYER_KICK],
    ),
  };

  return (message) => {
    const {type, content} = message;
    if (type === ROOM_MESSAGE_TYPES.PLAYER_MESSAGE)
      return message;

    const parser = SERVER_MESSAGES_PARSER[content.code];
    return {
      ...message,
      content: {
        muted: true,
        nick: t('server_nick'),
        message: parser?.(content) || 'Unknown server message',
      },
    };
  };
};

const RaceChatListHolder = styled(
  UnorderedList,
  {
    height: 220,
    marginBottom: 10,
    overflowY: 'auto',
  },
);

const RaceChat = ({gameBoard}) => {
  const t = useI18n();
  const messageParser = useMemo(
    () => processServerMessage(
      path => t(`game.screens.chat.${path}`),
    ),
    [],
  );
  const messagesListRef = useRef();

  const {client} = gameBoard;
  const [messages, setMessages] = useState(null);

  const onSendMessage = async (data) => {
    await gameBoard.client.sendChatMessage(data);

    const {current: listNode} = messagesListRef;
    if (listNode)
      listNode.scrollTop = listNode.scrollHeight;
  };

  usePromise(
    client.getChatMessages,
    {
      silent: true,
      keys: [client],
      afterExecFn: ({result}) => {
        setMessages(
          R.map(
            messageParser,
            result.messages,
          ),
        );
      },
    },
  );

  useClientChainListener(
    {
      client,
      action: PLAYER_ACTIONS.BROADCAST_CHAT_MESSAGE,
      method: (message) => {
        messages.push(
          messageParser(message),
        );
        setMessages(
          R.takeLast(60, messages),
        );
      },
    },
  );

  return (
    <div>
      <RaceChatListHolder ref={messagesListRef}>
        {(messages || []).map(
          message => (
            <RoomMessageItem
              key={message.id}
              roomMessage={message}
            />
          ),
        )}
      </RaceChatListHolder>

      <RaceChatMessageBox onSendMessage={onSendMessage} />
    </div>
  );
};

RaceChat.displayName = 'RaceChat';

export default React.memo(RaceChat);
