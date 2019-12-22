import PropTypes from 'prop-types';
import {styled} from '@pkg/fast-stylesheet/src/react';

export const flexCenteredStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const Flex = styled.div(
  {
    'direction-row': {
      flexDirection: 'row',
    },

    'direction-column': {
      flexDirection: 'column',
    },

    'justify-center': {justifyContent: 'center'},
    'justify-space-between': {justifyContent: 'space-between'},
    'justify-flex-end': {justifyContent: 'flex-end'},
    'justify-flex-start': {justifyContent: 'flex-start'},
    'justify-space-around': {justifyContent: 'space-around'},

    'align-center': {alignItems: 'center'},
    'align-flex-end': {alignItems: 'flex-end'},
    'align-flex-start': {alignItems: 'flex-start'},

    'wrap-wrap': {flexWrap: 'wrap'},

    base: {
      display: 'flex',
      composes: ['$row'],
    },
  },
  {
    index: 0,
    omitProps: ['justify', 'direction', 'align', 'wrap'],
    classSelector: (classes, {justify, direction, align, wrap}) => [
      justify && classes[`justify-${justify}`],
      direction && classes[`direction-${direction}`],
      align && classes[`align-${align}`],
      wrap && classes[`wrap-${wrap}`],
    ],
  },
);

Flex.displayName = 'Flex';

Flex.propTypes = {
  justify: PropTypes.string,
  direction: PropTypes.string,
  align: PropTypes.string,
  wrap: PropTypes.string,
};

export default Flex;
