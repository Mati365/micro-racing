import PropTypes from 'prop-types';
import * as R from 'ramda';

import {TEXT_COLORS} from '@pkg/basic-type-schemas/src/colors';

import {styled} from '@pkg/fast-stylesheet/src/react';
import Wrapper from './Wrapper';

const Text = styled(
  Wrapper,
  {
    ...R.compose(
      R.addIndex(R.reduce)(
        (acc, [key, value]) => {
          acc[`type-${R.toLower(key)}`] = {
            color: value,
          };
          return acc;
        },
        {},
      ),
      R.toPairs,
    )(TEXT_COLORS),

    base: {},

    expanded: {
      width: '100%',
    },

    'align-center': {textAlign: 'center'},
    'transform-uppercase': {textTransform: 'uppercase'},
    'transform-capitalize': {textTransform: 'capitalize'},

    'size-tiny': {fontSize: '9px'},
    'size-small': {fontSize: '11px'},

    'weight-900': {fontWeight: 900},
    'weight-800': {fontWeight: 800},
    'weight-700': {fontWeight: 700},
    'weight-600': {fontWeight: 600},
  },
  {
    index: 1,
    omitProps: [
      'display', 'type', 'weight', 'align',
      'size', 'transform', 'expanded',
    ],
    classSelector: (
      classes,
      {
        display, type, weight,
        expanded, align, size,
        transform,
      },
    ) => [
      display && classes[`display-${display}`],
      type && classes[`type-${type}`],
      weight && classes[`weight-${weight}`],
      size && classes[`size-${size}`],
      align && classes[`align-${align}`],
      transform && classes[`transform-${transform}`],
      expanded && classes.expanded,
    ],
  },
);

Text.displayName = 'Text';

Text.propTypes = {
  display: PropTypes.string,
  size: PropTypes.string,
  transform: PropTypes.string,
  align: PropTypes.string,
  type: PropTypes.string,
  expanded: PropTypes.bool,
  weight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default Text;
