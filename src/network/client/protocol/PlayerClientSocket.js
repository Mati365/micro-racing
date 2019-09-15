import * as R from 'ramda';

import {PLAYER_ACTIONS} from '../../constants/serverCodes';
import BinarySocketRPCWrapper from './BinarySocketRPCWrapper';

export default class PlayerClientSocket {
  static defaultApiMethods = {
    sendKeyState: {
      action: PLAYER_ACTIONS.PRESS_KEY,
      serialize: (keyCode, press) => ({
        keyCode,
        press,
      }),
      flags: {
        waitForResponse: false,
      },
    },

    joinRoom: {
      action: PLAYER_ACTIONS.JOIN_ROOM,
      serialize: R.objOf('name'),
      flags: {
        waitForResponse: true,
      },
    },

    fetchPlayerInfo: {
      action: PLAYER_ACTIONS.PLAYER_INFO,
      flags: {
        waitForResponse: true,
      },
    },

    startRace: {
      action: PLAYER_ACTIONS.START_ROOM_RACE,
      flags: {
        waitForResponse: true,
      },
    },
  };

  /**
   * Creates websocket connection and creates new PlayerClientSocket
   *
   * @returns {Promise}
   */
  static connect = (uri, clientParams) => new Promise((resolve, reject) => {
    const ws = new WebSocket(uri);
    ws.binaryType = 'arraybuffer';
    ws.onopen = async () => {
      const clientSocket = new PlayerClientSocket;
      await clientSocket.init(
        {
          ws,
          ...clientParams,
        },
      );

      resolve(clientSocket);
    };

    ws.onerror = reject;
  });

  /**
   * Load RPC wrappers, fetch initial player info
   *
   * @param {Object} config
   */
  async init({ws} = {}) {
    R.forEachObjIndexed(
      ({action, serialize = R.identity, flags}, methodName) => {
        this[methodName] = (...args) => this.rpc.sendBinaryRequest(
          action,
          serialize(...args),
          flags,
        );
      },
      PlayerClientSocket.defaultApiMethods,
    );

    this.listeners = {};
    this.rpc = new BinarySocketRPCWrapper(ws, this.listeners);
    this.info = await this.fetchPlayerInfo();
  }
}
