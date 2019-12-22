import PropTypes from 'prop-types';
import {styled} from '@pkg/fast-stylesheet/src/react';

const UnorderedList = styled.ul(
  {
    base: {
      margin: 0,
      padding: 0,

      '& > li': {
        listStyleType: 'none',
      },
    },

    row: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',

      '& > li': {
        display: 'inline-flex',
      },
    },
  },
  {
    index: 0,
    omitProps: ['row'],
    classSelector: (classes, {row}) => row && classes.row,
  },
);

UnorderedList.displayName = 'UnorderedList';

UnorderedList.propTypes = {
  row: PropTypes.bool,
};

UnorderedList.defaultProps = {
  row: false,
};

export default UnorderedList;
