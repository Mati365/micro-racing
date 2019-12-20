import {styled} from '@pkg/fast-stylesheet/src/react';
import {Text} from '@ui/basic-components/styled';

const GameHeader = styled(
  Text,
  {
    display: 'block',
    fontSize: '20px',
    marginBottom: 20,
  },
  {
    index: 3,
    props: {
      weight: 900,
      type: 'white',
    },
  },
);

GameHeader.displayName = 'GameHeader';

export default GameHeader;
