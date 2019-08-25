import React from 'react';
import createUseCSSHook from '../hooks/createUseCSSHook';

const injectClassesStylesheet = (styles, params) => (Component) => {
  const useCSS = createUseCSSHook(styles, params);

  const Wrapped = (props) => {
    const {classes} = useCSS();

    return (
      <Component
        {...props}
        classes={classes}
      />
    );
  };

  return Wrapped;
};

export default injectClassesStylesheet;
