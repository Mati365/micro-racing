import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';

const SSRRenderSwitch = ({children, allowSSR}) => {
  const [mounted, setMounted] = useState(allowSSR);

  useEffect(
    () => {
      !mounted && setMounted(true);
    },
    [],
  );

  return (
    mounted
      ? children()
      : null
  );
};

SSRRenderSwitch.displayName = 'SSRRenderSwitch';

SSRRenderSwitch.propTypes = {
  allowSSR: PropTypes.bool,
};

export const withSSRSwitch = switchProps => Component => props => (
  <SSRRenderSwitch
    {...switchProps}
    {...props}
  >
    {() => <Component {...props} />}
  </SSRRenderSwitch>
);

export default SSRRenderSwitch;
