import {useState} from 'react';

const useForceRerender = () => {
  const [, setTick] = useState(0);

  return () => setTick(tick => tick + 1);
};

export default useForceRerender;
