import uniqid from 'uniqid';
import * as R from 'ramda';

import {
  ROOM_MESSAGE_TYPES,
  PLAYER_ACTIONS,
} from '../constants/serverCodes';

import serializeBsonList from './utils/serializeBsonList';

export class RoomMessage {
  constructor(
    {
      id,
      type,
      content,
    },
  ) {
    this.type = type;
    this.date = Date.now();
    this.id = id || uniqid();
    this.content = content;
  }

  toListBSON() {
    const {
      id, date, type, content,
    } = this;

    return {
      id,
      date,
      type,
      content,
    };
  }
}

export class RoomPlayerMessage extends RoomMessage {
  constructor(player, message) {
    super(
      {
        type: ROOM_MESSAGE_TYPES.PLAYER_MESSAGE,
        content: {
          nick: player.info.nick || 'Unknown',
          color: player.info.racingState?.color,
          message,
        },
      },
    );
  }
}

export class RoomServerMessage extends RoomMessage {
  constructor({code, ...content}) {
    super(
      {
        type: ROOM_MESSAGE_TYPES.ROOM_BOT_MESSAGE,
        content: {
          code,
          ...content,
        },
      },
    );
  }
}

export default class RoomChat {
  constructor(
    {
      messagesLimit = 64,
      room,
    } = {},
  ) {
    this.room = room;
    this.messagesLimit = messagesLimit;
    this.messages = [];
  }

  post(message, player) {
    if (R.is(String, message))
      message = R.trim(message);

    if (!message || message.length > 100)
      return;

    if (R.is(String, message) && player)
      message = new RoomPlayerMessage(player, message);
    else if (!player)
      message = new RoomServerMessage(message);

    this.messages.push(message);
    this.messages = R.takeLast(this.messagesLimit, this.messages);

    this.room.sendBroadcastAction(
      null,
      PLAYER_ACTIONS.BROADCAST_CHAT_MESSAGE,
      null,
      message.toListBSON(),
    );
  }

  toListBSON() {
    return {
      limit: this.messagesLimit,
      messages: serializeBsonList(this.messages),
    };
  }
}
