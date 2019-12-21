import {useState} from 'react';
import useInterval from '../useInterval';

const useIntervalResourceFetch = (
  {
    fetchFn,
    delay = 1000,
  },
) => {
  const [fetchState, setFetchState] = useState(
    {
      loading: true,
      result: null,
    },
  );

  useInterval(
    async () => {
      try {
        setFetchState(
          {
            loading: false,
            result: await fetchFn(),
          },
        );
      } catch (e) {
        console.error(e);
        setFetchState(
          {
            loading: false,
            error: e,
            result: fetchState?.result || null,
          },
        );
      }
    },
    {
      initialRun: true,
      delay,
    },
  );

  return fetchState;
};

export default useIntervalResourceFetch;
