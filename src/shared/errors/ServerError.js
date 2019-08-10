export const ERROR_CODES = {
  ROOM_FULL: 'ROOM_FULL',
  ALREADY_KICKED: 'ALREADY_KICKED',
};

export default class ServerError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }

  toJSON() {
    const {code, message} = this;

    return {
      code,
      message,
    };
  }
}
