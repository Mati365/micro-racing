import {useRef, useEffect} from 'react';

const useUpdateEffect = (effect, keys = []) => {
  const isInitialMount = useRef(true);

  useEffect(
    () => {
      if (isInitialMount.current)
        isInitialMount.current = false;
      else
        effect();
    },
    keys,
  );
};

export default useUpdateEffect;
