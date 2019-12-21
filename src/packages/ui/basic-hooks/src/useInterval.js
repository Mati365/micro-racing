import {useRef, useEffect} from 'react';

const useInterval = (fn, {delay, initialRun}) => {
  const callbackRef = useRef(null);

  useEffect(
    () => {
      callbackRef.current = fn;
    },
    [fn],
  );

  useEffect(
    () => {
      if (delay === null)
        return undefined;

      const executorFn = (...args) => {
        const {current} = callbackRef;
        current && current(...args);
      };

      if (initialRun)
        executorFn();

      const id = setInterval(executorFn, delay);
      return () => clearInterval(id);
    },
    [delay],
  );
};

export default useInterval;
