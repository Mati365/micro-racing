import PropTypes from 'prop-types';

import {styled} from '@pkg/fast-stylesheet/src/react';
import withProps from '../decorators/withProps';

const Pull = styled.span(
  {
    base: {},

    'pull-left': {
      float: 'left',
    },

    'pull-right': {
      float: 'right',
    },
  },
  {
    index: 0,
    omitProps: ['left', 'right'],
    classSelector: (classes, {left, right}) => [
      classes[`pull-${right && !left ? 'right' : 'left'}`],
    ],
  },
);

Pull.displayName = 'Pull';

Pull.propTypes = {
  right: PropTypes.bool,
  left: PropTypes.bool,
};

Pull.Right = withProps(
  {
    right: true,
  },
)(Pull);

export default Pull;
