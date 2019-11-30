import React from 'react';

const withProps = newProps => (Component) => {
  const Wrapper = props => (
    <Component
      {...newProps}
      {...props}
    />
  );

  Wrapper.displayName = 'withProps';

  return Wrapper;
};

export default withProps;
