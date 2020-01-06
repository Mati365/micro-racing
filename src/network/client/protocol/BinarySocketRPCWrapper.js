import * as R from 'ramda';

import {Deferred, safeArray} from '@pkg/basic-helpers';

import {ACTION_FLAGS} from '../../constants/serverCodes';

import createActionMessage, {
  MAX_CMD_ID,
  MAGIC_NULL_CMD_ID,

  getMessageAction,
  getMessageMeta,

  isMessageFlagActive,
  getMessageContent,
} from '../../shared/utils/createActionMessage';

import ServerError from '../../shared/ServerError';

/**
 * Provides "http style" binary socket wrapper
 *
 * @see
 *  Max CMD ID count invoked simultaneously is 0xFFFF!
 */
export default class BinarySocketRPCWrapper {
  constructor(ws, listeners) {
    this.ws = ws;
    this.listeners = listeners;

    this.cmdResponseQueue = {
      __id: 0,
    };

    ws.addEventListener('message', this.onMessage);
  }

  chainListener(type, fn) {
    if (!fn)
      return R.F;

    let prevListeners = this.listeners[type];

    if (!prevListeners)
      this.listeners[type] = fn;
    else {
      if (prevListeners)
        prevListeners = safeArray(prevListeners);

      this.listeners[type] = [
        ...(prevListeners || []),
        fn,
      ];
    }

    return () => {
      const cachedListener = this.listeners[type];

      if (cachedListener === fn)
        delete this.listeners[type];
      else if (R.is(Array, cachedListener))
        this.listeners[type] = R.without([fn], cachedListener);
    };
  }

  /**
   * Watches messages from server
   *
   * @memberof BinarySocketRPCWrapper
   */
  onMessage = ({data}) => {
    const {listeners} = this;
    const msg = new Uint8Array(data);

    // calls from RPC methods
    if (isMessageFlagActive(ACTION_FLAGS.RESPONSE, msg)) {
      const {cmdID} = getMessageMeta(msg);
      if (cmdID === MAGIC_NULL_CMD_ID)
        return;

      const handler = this.cmdResponseQueue[cmdID];
      if (handler) {
        handler(
          getMessageContent(msg),
        );
        delete this.cmdResponseQueue[cmdID];
      }
    } else if (listeners) {
      // do not use there getMessageMeta
      // it is much slower and mem intense than getMessageAction
      const action = getMessageAction(msg);
      const handler = listeners[action];

      if (handler) {
        const content = getMessageContent(msg);

        if (handler.constructor === Array) {
          for (let i = 0; i < handler.length; ++i)
            handler[i](content);
        } else
          handler(content);
      }
    }
  };

  /**
   * Performs message call to socket server
   *
   * @param {Number} action
   * @param {Buffer} data
   * @param {Object} flags
   */
  sendBinaryRequest = (action, data, flags) => {
    const {ws, cmdResponseQueue} = this;

    let deferred = null;
    let cmdID = MAGIC_NULL_CMD_ID;

    // CMD ID field is one byte length
    // 0xFF is magic
    if (flags && flags.waitForResponse) {
      deferred = new Deferred;
      cmdID = cmdResponseQueue.__id;

      if (cmdResponseQueue[cmdID])
        throw new Error('BinarySocketWrapper buffer overflow!');

      cmdResponseQueue[cmdID] = (response) => {
        if (response.error) {
          deferred.reject(
            ServerError.fromJSON(response.error),
          );
        } else {
          deferred.resolve(
            flags.deserialize
              ? flags.deserialize(response)
              : response,
          );
        }
      };

      cmdResponseQueue.__id = (cmdResponseQueue.__id + 1) % MAX_CMD_ID;
    }

    ws.send(
      createActionMessage(
        cmdID,
        action,
        ACTION_FLAGS.REQUEST,
        data,
      ),
    );

    return deferred && deferred.promise;
  };

  /**
   * Remove all listeners
   */
  release() {
    const {ws} = this;

    ws.removeEventListener('message', this.onMessage);
  }
}
