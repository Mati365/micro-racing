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

    base: {
      composes: [
        '$type-default',
      ],
    },

    'weight-900': {fontWeight: 900},
    'weight-800': {fontWeight: 800},
    'weight-700': {fontWeight: 700},
    'weight-600': {fontWeight: 600},
  },
  {
    index: 1,
    omitProps: ['display', 'type', 'weight'],
    classSelector: (classes, {display, type, weight}) => [
      display && classes[`display-${display}`],
      type && classes[`type-${type}`],
      weight && classes[`weight-${weight}`],
    ],
  },
);

Text.displayName = 'Text';

Text.propTypes = {
  display: PropTypes.string,
  type: PropTypes.string,
  weight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default Text;
