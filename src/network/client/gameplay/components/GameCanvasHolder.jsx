import PropTypes from 'prop-types';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {Flex} from '@ui/basic-components/styled';

const GameCanvasHolder = styled(
  Flex,
  {
    base: {
      position: 'relative',

      '& canvas': {
        transition: 'filter 500ms ease-in-out',
      },
    },

    freeze: {
      '& canvas': {
        filter: 'blur(2px) brightness(0.1) grayscale(1.0)',
      },
    },
  },
  {
    props: {
      direction: 'column',
    },
    index: 1,
    omitProps: ['freeze'],
    classSelector: (classes, {freeze}) => freeze && classes.freeze,
  },
);

GameCanvasHolder.displayName = 'GameCanvasHolder';

GameCanvasHolder.propTypes = {
  freeze: PropTypes.bool,
};

export default GameCanvasHolder;
