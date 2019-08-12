import {Deferred} from '@pkg/basic-helpers';

import {ACTION_FLAGS} from '../constants/serverCodes';

import createActionMessage, {
  MAX_CMD_ID,
  MAGIC_NULL_CMD_ID,

  getMessageMeta,
  isMessageFlagActive,
  getMessageContent,
} from '../shared/utils/createActionMessage';

/**
 * Provides "http style" binary socket wrapper
 *
 * @see
 *  Max CMD ID count invoked simultaneously is 0xFFFF!
 */
export default class BinarySocketRPCWrapper {
  constructor(ws) {
    this.ws = ws;
    this.cmdResponseQueue = {
      __id: 0,
    };

    ws.addEventListener('message', this.onMessage);
  }

  onMessage = ({data}) => {
    const msg = new Uint8Array(data);

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

      cmdResponseQueue[cmdID] = deferred.resolve;
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

    return deferred;
  };

  /**
   * Remove all listeners
   */
  release() {
    const {ws} = this;

    ws.removeEventListener('message', this.onMessage);
  }
}
