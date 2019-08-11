export const PLAYER_ACTIONS = {
  JOIN_ROOM: 0,
};

const textEncoder = new TextEncoder;
const textDecoder = new TextDecoder;

const API_BINARY_ENCODERS = {
  [PLAYER_ACTIONS.JOIN_ROOM]: {
    encode: roomName => textEncoder.encode(roomName),
    decode: data => textDecoder.decode(data),
  },
};

export default API_BINARY_ENCODERS;
