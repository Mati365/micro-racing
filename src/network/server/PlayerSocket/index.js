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
      info,
      listeners,
    } = this;

    const boldNick = chalk.white.bold(info.nick);
    consola.info(`Welcome player ${boldNick}!`);

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
      this.onDisconnect?.();
      consola.info(`Bye bye player ${boldNick}!`);
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
   * Mount action listeners with provided decoders
   */
  listeners = {
    /** ROOM JOIN */
    [PLAYER_ACTIONS.JOIN_ROOM]: (cmdID, {name}) => {
      consola.info(`Wanna join to ${name}?`);
      this.sendActionResponse(
        cmdID,
        {
          a: 2,
        },
      );
    },
  }
}
