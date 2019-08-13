import consola from 'consola';
import chalk from 'chalk';

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

  mountMessagesHandler() {
    const {
      ws,
      server,
      info,
      listeners,
    } = this;

    server.rootRoom.join(info);
    consola.info(`Welcome player ${chalk.white.bold(info.nick)}!`);

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
      this.onDisconnect?.(this.info);
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
      room.join(info);
    else {
      room = server.createRoom(
        {
          owner: info,
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
  leave() {
    const {server, info} = this;

    if (info.room)
      info.room.leave(info);

    server.rootRoom.leave(info);
    consola.info(`Bye bye player ${chalk.white.bold(info.nick)}!`);
  }

  /**
   * Mount action listeners
   */
  listeners = {
    [PLAYER_ACTIONS.JOIN_ROOM]: (cmdID, {name}) => {
      const {info} = this;
      const room = this.joinRoom(name);

      consola.info(`Player ${chalk.white.bold(info.nick)} joined to ${chalk.white.bold(room.name)}!`);
    },
  }
}
