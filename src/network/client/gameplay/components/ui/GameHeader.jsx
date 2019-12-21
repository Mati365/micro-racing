
import PropTypes from 'prop-types';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {Text} from '@ui/basic-components/styled';

const GameHeader = styled(
  Text,
  {
    base: {
      display: 'block',
      fontSize: '20px',
    },

    spaced: {
      marginBottom: 20,
    },
  },
  {
    index: 3,
    omitProps: ['spaced'],
    classSelector: (classes, {spaced}) => spaced && classes.spaced,
    props: {
      weight: 900,
      type: 'white',
    },
  },
);

GameHeader.displayName = 'GameHeader';

GameHeader.propTypes = {
  spaced: PropTypes.bool,
};

GameHeader.defaultProps = {
  spaced: true,
};

export default GameHeader;
