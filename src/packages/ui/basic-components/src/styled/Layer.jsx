import PropTypes from 'prop-types';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {flexCenteredStyle} from './Flex';

export const layerStyle = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

const Layer = styled.div(
  {
    base: layerStyle,

    fixed: {
      position: 'fixed',
    },

    centered: {
      extend: flexCenteredStyle,
    },
  },
  {
    omitProps: ['centered', 'fixed'],
    classSelector: (classes, {fixed, centered}) => [
      fixed && classes.fixed,
      centered && classes.centered,
    ],
  },
);

Layer.displayName = 'Layer';

Layer.propTypes = {
  centered: PropTypes.bool,
  fixed: PropTypes.bool,
};

Layer.defaultProps = {
  centered: true,
};

export default Layer;
