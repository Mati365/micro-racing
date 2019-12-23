import {withInputs} from '@pkg/basic-hooks/src/inputs/useInputs';

const LinkedInputsObject = ({l, children}) => children(
  {
    l,
  },
);

LinkedInputsObject.displayName = 'LinkedInputsObject';

export default withInputs(LinkedInputsObject);
