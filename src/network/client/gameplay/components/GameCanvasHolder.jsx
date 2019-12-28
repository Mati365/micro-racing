import PropTypes from 'prop-types';

import {styled} from '@pkg/fast-stylesheet/src/react';
import {Flex} from '@ui/basic-components/styled';

const GameCanvasHolder = styled(
  Flex,
  {
    base: {
      position: 'relative',

      '& canvas-html-wrapper > canvas': {
        display: 'block',
        transition: 'filter 500ms ease-in-out',
      },
    },

    expanded: {
      height: '100vh',
      padding: 10,
    },

    freeze: {
      '& canvas-html-wrapper > canvas': {
        filter: 'blur(2px) brightness(0.1) grayscale(1.0)',
      },
    },
  },
  {
    props: {
      direction: 'column',
      justify: 'center',
    },
    index: 1,
    omitProps: ['freeze', 'expanded'],
    classSelector: (classes, {expanded, freeze}) => [
      expanded && classes.expanded,
      freeze && classes.freeze,
    ],
  },
);

GameCanvasHolder.displayName = 'GameCanvasHolder';

GameCanvasHolder.propTypes = {
  freeze: PropTypes.bool,
  expanded: PropTypes.bool,
};

export default GameCanvasHolder;
