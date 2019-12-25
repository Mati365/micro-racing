import {useEffect} from 'react';

import usePromiseCallback from './usePromiseCallback';

const usePromise = (fn, {keys = [], ...promiseFlags} = {}) => {
  const [promiseExecutor, promiseState] = usePromiseCallback(
    fn,
    {
      ...promiseFlags,
      keys,
      initialPromiseState: {
        loading: true,
      },
    },
  );

  useEffect(
    () => {
      promiseExecutor();
    },
    keys,
  );

  return promiseState;
};

export default usePromise;
