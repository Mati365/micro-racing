import consola from 'consola';
import chalk from 'chalk';
import * as R from 'ramda';

import API_BINARY_ENCODERS, {PLAYER_ACTIONS} from '../../constants/apiBinaryEncoders';

import PlayerInfo from './PlayerInfo';

const provideListenersDecoder = R.mapObjIndexed(
  (listener, actionName) => {
    const decoder = API_BINARY_ENCODERS[actionName].decode;

    return data => listener(
      decoder(data),
    );
  },
);

/**
 * Socket API provider for player
 */
export default class PlayerSocket {
  constructor({
    ws,
    gameServer,
    info = new PlayerInfo,
    onDisconnect,
  }) {
    this.gameServer = gameServer;
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
      const listener = listeners[message[0]];
      if (!listener)
        return;

      listener(
        message.slice(1, message.length), // drop action byte
      );
    });

    ws.on('close', () => {
      this.onDisconnect?.();
      consola.info(`Bye bye player ${boldNick}!`);
    });
  }

  /**
   * Mount action listeners with provided decoders
   */
  listeners = provideListenersDecoder(
    {
      /** ROOM JOIN */
      [PLAYER_ACTIONS.JOIN_ROOM]: (roomName) => {
        consola.info(`Wanna join to ${roomName}?`);
      },
    },
  );
}
