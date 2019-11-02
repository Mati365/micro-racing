import * as R from 'ramda';
import wrapMethod from './wrapMethod';

export const logFunction = (logger, {afterExec, target} = {}) => fn => (...args) => {
  if (!afterExec)
    logger(target, ...args);

  const result = fn(...args);
  if (afterExec) {
    const postLoad = (_result = result) => logger(target, _result, ...args);

    if (R.is(Promise, result)) {
      result.then((data) => {
        postLoad(data);
        return data;
      });
    } else
      postLoad();
  }

  return result;
};

const logMethod = (logger, loggerParams) => wrapMethod(
  (wrappedFn, target) => logFunction(
    logger,
    {
      ...loggerParams,
      target,
    },
  )(wrappedFn),
);

export default logMethod;
