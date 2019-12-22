import wrapMethod from './wrapMethod';

export const shallowNotEq = (a, b) => {
  if (a.length !== b.length)
    return true;

  for (let i = a.length - 1; i >= 0; --i) {
    if (a[i] !== b[i])
      return true;
  }

  return false;
};


export const cacheOneCall = cacheFn => (fn) => {
  let previousArgs = null;
  let previousReturn = null;

  return function memoize(...args) {
    if (previousArgs !== null && !cacheFn(previousArgs, args))
      return previousReturn;

    previousReturn = fn(...args);
    previousArgs = args;
    return previousReturn;
  };
};

export default wrapMethod(
  cacheOneCall(shallowNotEq),
);
