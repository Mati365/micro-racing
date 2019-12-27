import {
  useRef,
  useState,
  useEffect,
} from 'react';

import * as R from 'ramda';

import useMountedRef from '../useMountedRef';

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
  const mountedRef = useMountedRef();
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
        if (!mountedRef.current)
          return;

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
