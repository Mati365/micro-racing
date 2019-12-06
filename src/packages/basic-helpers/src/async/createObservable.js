import * as R from 'ramda';

const createObservable = () => {
  const observers = {
    current: [],
  };

  return {
    notify(value) {
      const {current: list} = observers;

      for (let i = 0; i < list.length; ++i)
        list[i](value);
    },

    subscribe(fn) {
      observers.current.push(fn);

      return () => {
        observers.current = R.without([fn], observers.current);
      };
    },
  };
};

export const createObservablesUnmounter = (...observables) => () => {
  for (let i = 0; i < observables.length; ++i)
    observables[i]();
};

export default createObservable;
