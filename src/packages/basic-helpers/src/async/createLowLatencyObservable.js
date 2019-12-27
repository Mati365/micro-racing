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
    get observers() {
      return observers.current;
    },

    getLastValue() { return lastValue; },

    notify(value) {
      const {current: list} = observers;

      lastValue = value;
      for (let i = 0; i < list.length; ++i)
        list[i](value);
    },

    subscribe(fn, emitOnMount = false) {
      if (!fn)
        return R.F;

      observers.current.push(fn);
      if (emitOnMount)
        fn(lastValue);

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
