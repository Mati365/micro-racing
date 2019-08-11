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
  }) {
    this.gameServer = gameServer;
    this.ws = ws;
    this.info = info;

    this.mountMessagesHandler();
  }

  /**
   * Mount action decoders
   */
  listeners = provideListenersDecoder(
    {
      [PLAYER_ACTIONS.JOIN_ROOM]: (roomName) => {
        consola.info(`Wanna join to ${roomName}?`);
      },
    },
  );

  mountMessagesHandler() {
    const {
      ws,
      info,
      listeners,
    } = this;

    consola.info(`Welcome player ${chalk.white.bold(info.nick)}!`);
    ws.on(
      'message',
      (message) => {
        const listener = listeners[message[0]];
        if (!listener)
          return;

        listener(
          message.slice(1, message.length), // drop action byte
        );
      },
    );
  }
}
