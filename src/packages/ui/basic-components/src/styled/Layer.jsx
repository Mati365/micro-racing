import PropTypes from 'prop-types';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {flexCenteredStyle} from './Flex';

const Layer = styled.div(
  {
    base: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
    },

    centered: {
      extend: flexCenteredStyle,
    },
  },
  {
    omitProps: ['centered'],
    classSelector: (classes, {centered}) => centered && classes.centered,
  },
);

Layer.displayName = 'Layer';

Layer.propTypes = {
  centered: PropTypes.bool,
};

Layer.defaultProps = {
  centered: true,
};

export default Layer;
