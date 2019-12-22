import {useState} from 'react';
import useInterval from '../useInterval';
import useMountedRef from '../useMountedRef';

const useIntervalResourceFetch = (
  {
    fetchFn,
    delay = 1000,
  },
) => {
  const mountedRef = useMountedRef();
  const [fetchState, setFetchState] = useState(
    {
      loading: true,
      result: null,
    },
  );

  useInterval(
    async () => {
      try {
        if (!mountedRef.current)
          return;

        const result = await fetchFn();
        mountedRef.current && setFetchState(
          {
            loading: false,
            result,
          },
        );
      } catch (e) {
        console.error(e);
        mountedRef.current && setFetchState(
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
