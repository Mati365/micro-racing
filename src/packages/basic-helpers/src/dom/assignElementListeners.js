import * as R from 'ramda';

const assignElementListeners = (handlers, element) => {
  if (!element)
    return R.F;

  const execAssignMapperFn = fnName => R.forEachObjIndexed(
    (handler, eventName) => (::element[fnName])(eventName, handler),
    handlers,
  );

  execAssignMapperFn('addEventListener');
  return () => {
    execAssignMapperFn('removeEventListener');
    return true;
  };
};

export default R.curry(assignElementListeners);
