import * as R from 'ramda';

import API_BINARY_ENCODERS, {PLAYER_ACTIONS} from '../constants/apiBinaryEncoders';

import createActionMessage from '../shared/utils/createActionMessage';

export default class PlayerClientSocket {
  static defaultApiMethods = {
    joinRoom: PLAYER_ACTIONS.JOIN_ROOM,
  };

  /**
   * Creates websocket connection and creates new PlayerClientSocket
   *
   * @returns {Promise}
   */
  static connect = (uri, clientParams) => new Promise((resolve, reject) => {
    const ws = new WebSocket(uri);
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
    this.ws = ws;

    R.forEachObjIndexed(
      (actionName, methodName) => {
        const encoder = API_BINARY_ENCODERS[actionName].encode;

        this[methodName] = (...args) => this.sendAPIMessage(
          actionName,
          encoder(...args),
        );
      },
      PlayerClientSocket.defaultApiMethods,
    );
  }

  /** @todo: Return response */
  sendAPIMessage = (action, data) => {
    const {ws} = this;

    ws.send(
      createActionMessage(action, data),
    );
  };
}
