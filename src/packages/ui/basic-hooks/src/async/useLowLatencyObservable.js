import {useState, useEffect} from 'react';
import * as R from 'ramda';

/**
 * @see createLowLatencyObservable
 */
const useLowLatencyObservable = ({observable, parserFn = R.identity}) => {
  const [value, setValue] = useState(null);

  useEffect(
    () => observable.subscribe(
      newValue => setValue(parserFn(newValue)),
      true,
    ),
    [observable],
  );

  return value;
};

export default useLowLatencyObservable;
