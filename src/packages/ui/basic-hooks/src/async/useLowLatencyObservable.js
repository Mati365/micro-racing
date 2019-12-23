import {
  useRef,
  useState,
  useEffect,
} from 'react';

import * as R from 'ramda';

/**
 * @see createLowLatencyObservable
 */
const useLowLatencyObservable = (
  {
    parserFn = R.identity,
    watchOnly,
    observable,
    onChange,
  },
) => {
  const changeListenerRef = useRef();
  const [state, setState] = useState(
    {
      value: null,
    },
  );

  changeListenerRef.current = onChange;

  useEffect(
    () => observable.subscribe(
      (newValue) => {
        const parsedValue = parserFn(newValue);

        if (watchOnly && changeListenerRef.current)
          changeListenerRef.current(parsedValue);
        else {
          setState(
            {
              value: parsedValue,
            },
          );
        }
      },
      true,
    ),
    [observable],
  );

  return state.value;
};

export default useLowLatencyObservable;
