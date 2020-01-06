import BSON from 'bson';

import {ACTION_FLAGS} from '../../constants/serverCodes';

export const MAX_CMD_ID = 0xFFFF;

export const MAGIC_NULL_CMD_ID = 0xFFFF; // ID ignored in client callback search

export const META_MESSAGE_LENGTH = 4;

/**
 * Checks byt flag in message
 *
 * @param {Number} flag
 * @param {Array} msg
 */
export const isMessageFlagActive = (flag, msg) => (msg[3] & flag) === flag;

export const getMessageContent = (msg) => {
  const content = msg.slice(META_MESSAGE_LENGTH, msg.length);

  return (
    isMessageFlagActive(ACTION_FLAGS.BSON_PAYLOAD, msg)
      ? BSON.deserialize(content)
      : content
  );
};

export const getMessageAction = msg => msg[2];

export const getMessageMeta = msg => ({
  cmdID: msg[0] | (msg[1] << 0x8),
  action: msg[2],
  flags: msg[3],
});

/**
 * [LOW CMD ID][HIGH CMD ID]
 * allows client to wait for response, 0xFF is when ID is not provided
 *
 * Flags:
 * [00000YYX] - X is Request / Response flags
 *              Y payload type array / bson
 * Message:
 * [CMD ID][ACTION][FLAGS][   CONTENT   ]
 */
const createActionMessage = (cmdID, actionCode, flags, data) => {
  let payloadTypeFlag = ACTION_FLAGS.ARRAYBUF_PAYLOAD;
  if (!data || data.byteLength === undefined) {
    payloadTypeFlag = ACTION_FLAGS.BSON_PAYLOAD;
    data = BSON.serialize(data);
  }

  const {byteLength: len} = data;
  const tmp = new Uint8Array(META_MESSAGE_LENGTH + len);

  if (cmdID === null)
    cmdID = MAGIC_NULL_CMD_ID;

  tmp[0] = cmdID & 0xFF;
  tmp[1] = (cmdID >> 0x8) & 0xFF;

  tmp[2] = actionCode;
  tmp[3] = flags | payloadTypeFlag;

  tmp.set(data, META_MESSAGE_LENGTH);

  return tmp;
};

export default createActionMessage;
