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
