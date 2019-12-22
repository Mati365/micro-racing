import {useRef, useEffect} from 'react';

const useMountedRef = () => {
  const mountedRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  return mountedRef;
};

export default useMountedRef;
