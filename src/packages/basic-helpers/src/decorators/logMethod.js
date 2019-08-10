import wrapMethod from './wrapMethod';

const logMethod = logger => wrapMethod(
  (wrappedFn, target) => (...args) => {
    logger(target, ...args);
    return wrappedFn(...args);
  },
);

export default logMethod;
