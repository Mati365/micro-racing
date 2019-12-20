import PropTypes from 'prop-types';

import {styled} from '@pkg/fast-stylesheet/src/react';
import format from '@pkg/basic-helpers/base/format';
import generateNthStyles from './utils/generateNthStyles';

const MARGIN_LEVELS = 7;
const MARGIN_STEP = 5;

const MARGIN_DIRECTION_STYLE = PropTypes.oneOfType(
  [
    PropTypes.number,
    PropTypes.string,
  ],
);

const generateDirectionStyles = (classNameFormat, style, step, levels) => ({
  [format(classNameFormat, ['auto'])]: {
    [style]: 'auto',
  },

  ...generateNthStyles(
    classNameFormat,
    levels,
    index => ({
      [style]: (index + 1) * step,
    }),
  ),
});

const Margin = styled.div(
  {
    base: {
      display: 'inline-block',
    },

    block: {
      display: 'block',
    },

    ...generateDirectionStyles('left-%{}', 'margin-left', MARGIN_STEP, MARGIN_LEVELS),
    ...generateDirectionStyles('right-%{}', 'margin-right', MARGIN_STEP, MARGIN_LEVELS),
    ...generateDirectionStyles('top-%{}', 'margin-top', MARGIN_STEP, MARGIN_LEVELS),
    ...generateDirectionStyles('bottom-%{}', 'margin-bottom', MARGIN_STEP, MARGIN_LEVELS),
  },
  {
    omitProps: [
      'block',
      'top', 'bottom',
      'left', 'right',
    ],
    classSelector: (
      classes,
      {
        block,
        left, right,
        top, bottom,
      },
    ) => [
      block && classes.block,
      left && classes[`left-${left}`],
      right && classes[`right-${right}`],
      top && classes[`top-${top}`],
      bottom && classes[`bottom-${bottom}`],
    ],
  },
);

Margin.displayName = 'Margin';

Margin.propTypes = {
  top: MARGIN_DIRECTION_STYLE,
  bottom: MARGIN_DIRECTION_STYLE,
  left: MARGIN_DIRECTION_STYLE,
  right: MARGIN_DIRECTION_STYLE,
};

export default Margin;
