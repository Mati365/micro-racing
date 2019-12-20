import {ERROR_CODES} from '../../constants/serverCodes';
import ServerError from '../ServerError';

const serializeServerError = (e) => {
  const serializedError = (
    e?.toJSON
      ? e
      : new ServerError(ERROR_CODES.UNEXPECTED_ERROR)
  );

  return {
    error: serializedError.toJSON(),
  };
};

export default serializeServerError;
