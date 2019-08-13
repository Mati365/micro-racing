import wrapMethod from './wrapMethod';

export const logFunction = (logger, {afterExec, target} = {}) => fn => (...args) => {
  if (!afterExec)
    logger(target, ...args);

  const result = fn(...args);
  if (afterExec)
    logger(target, result, ...args);

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
