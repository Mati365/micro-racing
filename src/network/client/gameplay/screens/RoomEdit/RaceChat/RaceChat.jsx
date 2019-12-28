import React, {useRef, useState, useMemo, useEffect} from 'react';
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

import {layerStyle} from '@ui/basic-components/styled/Layer';

import {
  Flex,
  Text,
  UnorderedList,
} from '@ui/basic-components/styled';

import RaceChatMessageBox from './RaceChatMessageBox';
import useClientChainListener from '../../../hooks/useClientChainListener';
import RoomMessageItem from './RoomMessageItem';

const PlayerNickLabel = ({color, nick}) => (
  <Text
    style={{
      color,
    }}
    weight={800}
  >
    {capitalize(nick)}
  </Text>
);

const processServerMessage = (t) => {
  const translations = t('server_messages');
  const formatNickMessage = (translation, styles) => ({color, nick}) => {
    const formattedMessage = reactFormat(
      translation,
      [
        <PlayerNickLabel
          key='nick'
          nick={nick}
          color={color}
        />,
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

    [ROOM_SERVER_MESSAGES_TYPES.PLAYER_RENAME]: ({prevNick, nick, color}) => reactFormat(
      translations[ROOM_SERVER_MESSAGES_TYPES.PLAYER_RENAME],
      [
        <PlayerNickLabel
          key='prevNick'
          nick={prevNick}
          color={color}
        />,

        <PlayerNickLabel
          key='nick'
          nick={nick}
          color={color}
        />,
      ],
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
    extend: layerStyle,

    overflowY: 'auto',
  },
);

const RaceChat = ({gameBoard, ...props}) => {
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

  const resetScroll = () => {
    const {current: listNode} = messagesListRef;
    if (listNode)
      listNode.scrollTop = listNode.scrollHeight;
  };

  const onSendMessage = async (data) => {
    await gameBoard.client.sendChatMessage(data);
    resetScroll();
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

  const firstMount = useRef(false);
  useEffect(
    () => {
      const {current: listNode} = messagesListRef;

      if (!messages || !listNode)
        return;

      if (!firstMount.current
          || listNode.scrollTop >= (listNode.scrollHeight - listNode.offsetHeight) - 50)
        resetScroll();

      firstMount.current = true;
    },
    [messages?.length],
  );

  return (
    <Flex
      direction='column'
      {...props}
    >
      <div
        style={{
          position: 'relative',
          flex: 1,
          marginBottom: 10,
        }}
      >
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
      </div>

      <RaceChatMessageBox onSendMessage={onSendMessage} />
    </Flex>
  );
};

RaceChat.displayName = 'RaceChat';

export default React.memo(RaceChat);
