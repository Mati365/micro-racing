import {useState, useEffect} from 'react';
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

export default SSRRenderSwitch;
