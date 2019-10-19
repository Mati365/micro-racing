import {styled} from '@pkg/fast-stylesheet/src/react';
import Text from './Text';

export const CLEAR_BUTTON_STYLE = {
  background: 'none',
  border: 'none',
  outline: 'none',
  padding: 0,
  margin: 0,
};

const TextButton = styled(
  Text,
  {
    extend: CLEAR_BUTTON_STYLE,
    cursor: 'pointer',

    '&:hover': {
      textDecoration: 'underline',
    },
  },
  {
    index: 2,
    props: {
      tag: 'button',
    },
  },
);

TextButton.displayName = 'TextButton';

export default TextButton;
