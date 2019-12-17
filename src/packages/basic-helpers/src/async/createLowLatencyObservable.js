import * as R from 'ramda';

/**
 * Rx.JS performance is not good enough for
 * e.g. map items position update
 */
const createLowLatencyObservable = (initialValue = null) => {
  const observers = {
    current: [],
  };

  let lastValue = initialValue;

  return {
    getLastValue() { return lastValue; },

    notify(value) {
      const {current: list} = observers;

      lastValue = value;
      for (let i = 0; i < list.length; ++i)
        list[i](value);
    },

    subscribe(fn) {
      if (!fn)
        return R.F;

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

export default createLowLatencyObservable;
