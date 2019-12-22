import {styled} from '@pkg/fast-stylesheet/src/react';
import {UnorderedList} from '@ui/basic-components/styled';

const GameCardsList = styled(
  UnorderedList,
  {
    '& li': {
      marginRight: 10,
      marginBottom: 10,
    },
  },
  {
    props: {
      row: true,
    },
  },
);

export default GameCardsList;
