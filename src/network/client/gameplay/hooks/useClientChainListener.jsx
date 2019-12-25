import {useRef, useEffect} from 'react';

const useClientChainListener = ({client, action, method, afterReleaseFn}) => {
  const methodRef = useRef();
  methodRef.current = method;

  const releaseRef = useRef();
  releaseRef.current = afterReleaseFn;

  return useEffect(
    () => {
      const _method = (...args) => methodRef.current(...args);
      const unmountListener = client.rpc.chainListener(action, _method);

      return () => {
        unmountListener();
        releaseRef.current?.();
      };
    },
    [client],
  );
};

export default useClientChainListener;
