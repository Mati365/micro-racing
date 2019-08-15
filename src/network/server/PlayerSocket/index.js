import consola from 'consola';
import chalk from 'chalk';

import logMethod, {logFunction} from '@pkg/basic-helpers/decorators/logMethod';

import {
  PLAYER_ACTIONS,
  ACTION_FLAGS,
} from '../../constants/serverCodes';

import PlayerInfo from './PlayerInfo';

import createActionMessage, {
  getMessageMeta,
  getMessageContent,
} from '../../shared/utils/createActionMessage';

/**
 * Socket API provider for player
 */
export default class PlayerSocket {
  constructor({
    ws,
    server,
    info = new PlayerInfo,
    onDisconnect,
  }) {
    this.server = server;
    this.ws = ws;
    this.info = info;
    this.onDisconnect = onDisconnect;

    this.mountMessagesHandler();
  }

  get id() {
    return this.info.id;
  }

  @logMethod(
    ({info}) => {
      consola.info(`Welcome player ${chalk.white.bold(info.nick)}!`);
    },
    {
      afterExec: true,
    },
  )
  mountMessagesHandler() {
    const {
      ws,
      server,
      listeners,
    } = this;

    server.rootRoom.join(this);

    ws.on('message', (message) => {
      const {cmdID, action} = getMessageMeta(message);
      const listener = listeners[action];
      if (!listener)
        return;

      listener(
        cmdID,
        getMessageContent(message),
      );
    });

    ws.on('close', () => {
      this.leave();
      this.onDisconnect?.(this);
    });
  }

  /**
   * Sends response callback to client
   *
   * @param {Int} cmdID Action identifier on client
   * @param {Object|Array} data
   */
  sendActionResponse(cmdID, data) {
    const {ws} = this;

    ws.send(
      createActionMessage(
        cmdID,
        null,
        ACTION_FLAGS.RESPONSE,
        data,
      ),
    );
  }

  /**
   * Append player to both rooms
   */
  joinRoom(name) {
    const {server, info} = this;

    let room = server.findRoom(name);
    if (room)
      room.join(this);
    else {
      room = server.createRoom(
        {
          owner: this,
          name,
        },
      );
    }

    info.room = room;
    return room;
  }

  /**
   * Remove user from root players list and room
   */
  @logMethod(
    ({info}) => {
      consola.info(`Bye bye player ${chalk.white.bold(info.nick)}!`);
    },
    {
      afterExec: true,
    },
  )
  leave() {
    const {server, info} = this;
    const {room} = info;

    room?.leave(this);
    server.rootRoom.leave(this);
  }

  /**
   * Mount action listeners
   */
  listeners = {
    [PLAYER_ACTIONS.JOIN_ROOM]: logFunction(
      (_, room) => {
        consola.info(`Player ${chalk.white.bold(this.info.nick)} joined to ${chalk.white.bold(room.name)}!`);
      },
      {
        afterExec: true,
      },
    )(
      (cmdID, {name}) => {
        const room = this.joinRoom(name);
        this.sendActionResponse(
          cmdID,
          room.getBroadcastSocketJSON(),
        );
        return room;
      },
    ),
  }
}
