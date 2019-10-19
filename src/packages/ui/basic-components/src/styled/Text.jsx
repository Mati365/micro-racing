import PropTypes from 'prop-types';
import * as R from 'ramda';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {TEXT_COLORS} from '@pkg/basic-type-schemas/src/colors';
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
  },
  {
    index: 1,
    omitProps: ['display', 'type'],
    classSelector: (classes, {display, type}) => [
      display && classes[`display-${display}`],
      type && classes[`type-${type}`],
    ],
  },
);

Text.displayName = 'Text';

Text.propTypes = {
  display: PropTypes.string,
  type: PropTypes.string,
};

export default Text;
