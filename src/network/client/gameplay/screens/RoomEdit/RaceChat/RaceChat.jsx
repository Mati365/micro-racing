import React, {useRef, useState} from 'react';
import * as R from 'ramda';

import {PLAYER_ACTIONS} from '@game/network/constants/serverCodes';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {usePromise} from '@ui/basic-hooks';

import {UnorderedList} from '@ui/basic-components/styled';
import RaceChatMessageBox from './RaceChatMessageBox';
import useClientChainListener from '../../../hooks/useClientChainListener';
import RoomMessageItem from './RoomMessageItem';

const RaceChatListHolder = styled(
  UnorderedList,
  {
    height: 220,
    marginBottom: 10,
    overflowY: 'auto',
  },
);

const RaceChat = ({gameBoard}) => {
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
        setMessages(result.messages);
      },
    },
  );

  useClientChainListener(
    {
      client,
      action: PLAYER_ACTIONS.BROADCAST_CHAT_MESSAGE,
      method: (message) => {
        messages.push(message);
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
