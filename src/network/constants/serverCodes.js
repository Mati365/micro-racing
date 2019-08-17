export const ERROR_CODES = {
  ROOM_FULL: 'ROOM_FULL',
  ROOM_ALREADY_EXISTS: 'ROOM_ALREADY_EXISTS',
  ALREADY_KICKED: 'ALREADY_KICKED',
};

export const ACTION_FLAGS = {
  // TYPE
  REQUEST: 0b0,
  RESPONSE: 0b1,

  // RESPONSE_TYPE
  ARRAYBUF_PAYLOAD: 0b000,
  BSON_PAYLOAD: 0b100,
};

export const PLAYER_ACTIONS = {
  PLAYER_INFO: 0,
  JOIN_ROOM: 1,

  // BROADCAST
  PLAYER_JOINED_TO_ROOM: 2,
  PLAYER_LEFT_FROM_ROOM: 3,
};

export const CAR_TYPES = {
  RED: 0,
  BLUE: 1,
};

export const OBJECT_TYPES = {
  PRIMITIVE: 0,
  ROAD: 1,
  TERRAIN: 2,
  PLAYER: 3,
};
