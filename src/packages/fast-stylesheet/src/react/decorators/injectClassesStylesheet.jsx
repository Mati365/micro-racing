import React from 'react';
import createUseCSSHook from '../hooks/createUseCSSHook';

const injectClassesStylesheet = (styles, params) => (Component) => {
  const useCSS = createUseCSSHook(styles, params);

  const Wrapped = React.forwardRef((props, ref) => {
    const {classes} = useCSS();

    return (
      <Component
        {...props}
        ref={ref}
        classes={classes}
      />
    );
  });

  return Wrapped;
};

export default injectClassesStylesheet;
