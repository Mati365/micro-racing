import {styled} from '@pkg/fast-stylesheet/src/react';

const UnorderedList = styled.ul(
  {
    margin: 0,
    padding: 0,
  },
  {
    index: 0,
  },
);

UnorderedList.displayName = 'UnorderedList';

export default UnorderedList;
