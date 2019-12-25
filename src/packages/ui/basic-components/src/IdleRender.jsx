import React, {useState, useEffect} from 'react';

const idleFn = (fn) => {
  if (window.requestIdleCallback) {
    const callback = window.requestIdleCallback(fn);
    return () => {
      window.cancelIdleCallback(callback);
    };
  }

  const callback = window.setTimeout(fn, 250);
  return () => {
    window.clearTimeout(callback);
  };
};

const IdleRender = ({
  children,
  pause,
  loadingComponent: LoadingComponent = 'div',
}) => {
  const [visible, setVisible] = useState();

  useEffect(
    () => {
      if (pause || visible)
        return undefined;

      return idleFn(() => {
        setVisible(true);
      });
    },
    [!!pause],
  );

  return (
    visible
      ? children()
      : <LoadingComponent />
  );
};

IdleRender.displayName = 'IdleRender';

export default IdleRender;
