import {useState, useEffect} from 'react';
import * as R from 'ramda';

/**
 * @see createLowLatencyObservable
 */
const useLowLatencyObservable = ({observable, parserFn = R.identity}) => {
  const [state, setState] = useState(
    {
      value: null,
    },
  );

  useEffect(
    () => observable.subscribe(
      newValue => setState(
        {
          value: parserFn(newValue),
        },
      ),
      true,
    ),
    [observable],
  );

  return state.value;
};

export default useLowLatencyObservable;
