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

const IdleRender = ({children, loadingComponent: LoadingComponent = 'div'}) => {
  const [visible, setVisible] = useState();

  useEffect(() => idleFn(() => {
    setVisible(true);
  }));

  return (
    visible
      ? children()
      : <LoadingComponent />
  );
};

IdleRender.displayName = 'IdleRender';

export default IdleRender;
