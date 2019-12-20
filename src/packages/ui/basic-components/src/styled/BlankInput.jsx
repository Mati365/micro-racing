import {styled} from '@pkg/fast-stylesheet/src/react';
import {CLEAR_INPUT_STYLE} from './TextButton';

const BlankInput = styled.input(
  CLEAR_INPUT_STYLE,
  {
    index: 2,
  },
);

BlankInput.displayName = 'BlankInput';

export default BlankInput;
