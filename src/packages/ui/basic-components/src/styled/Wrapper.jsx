import PropTypes from 'prop-types';
import {styled} from '@pkg/fast-stylesheet/src/react';

const Wrapper = styled.span(
  {
    'display-inline-block': {display: 'inline-block'},
    'display-block': {display: 'block'},
    'display-inline': {display: 'inline'},

    'position-relative': {position: 'relative'},
    'position-fixed': {position: 'fixed'},
    'position-absolute': {position: 'absolute'},

    base: {
      composes: [
        '$display-inline-block',
      ],
    },

    expanded: {
      width: '100%',
      height: '100%',
    },
  },
  {
    index: 0,
    omitProps: ['display', 'position', 'expanded'],
    classSelector: (classes, {display, position, expanded}) => [
      display && classes[`display-${display}`],
      position && classes[`position-${position}`],
      expanded && classes.expanded,
    ],
  },
);

Wrapper.displayName = 'Wrapper';

Wrapper.propTypes = {
  display: PropTypes.string,
  position: PropTypes.string,
  expanded: PropTypes.bool,
};

export default Wrapper;
