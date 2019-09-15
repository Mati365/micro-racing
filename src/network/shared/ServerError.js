export default class ServerError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }

  static fromJSON({code, message}) {
    return new ServerError(
      code,
      message || `Uncaught server error code: ${code}!`,
    );
  }

  toJSON() {
    const {code, message} = this;

    return {
      code,
      message,
    };
  }
}
