import * as R from 'ramda';

import {PLAYER_ACTIONS} from '../constants/serverCodes';
import BinarySocketRPCWrapper from './BinarySocketRPCWrapper';

export default class PlayerClientSocket {
  static defaultApiMethods = {
    joinRoom: {
      action: PLAYER_ACTIONS.JOIN_ROOM,
      serialize: R.objOf('name'),
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
    ws.onopen = () => {
      resolve(
        new PlayerClientSocket(
          {
            ws,
            ...clientParams,
          },
        ),
      );
    };

    ws.onerror = (err) => {
      reject(err);
    };
  });

  constructor({ws} = {}) {
    this.rpc = new BinarySocketRPCWrapper(ws);
    this.state = [];

    R.forEachObjIndexed(
      ({action, serialize}, methodName) => {
        this[methodName] = (...args) => this.rpc.sendBinaryRequest(
          action,
          serialize(...args),
        );
      },
      PlayerClientSocket.defaultApiMethods,
    );
  }
}
