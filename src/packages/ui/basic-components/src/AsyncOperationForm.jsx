import React, {useRef} from 'react';

import {
  usePromiseCallback,
  useInputs,
} from '@ui/basic-hooks';

const AsyncOperationForm = ({onSubmit, initialData, children, ...props}) => {
  const [_onSubmit, promiseState] = usePromiseCallback(onSubmit);
  const modifiedFlagRef = useRef(false);

  const {l, value} = useInputs(
    {
      initialData,
      onChange: () => {
        modifiedFlagRef.current = true;
      },
    },
  );

  return (
    <form
      {...props}
      onSubmit={(e) => {
        e.preventDefault();
        _onSubmit(value);
      }}
    >
      {children(
        {
          l,
          value,
          promiseState,
          modified: modifiedFlagRef.current,
        },
      )}
    </form>
  );
};

AsyncOperationForm.displayName = 'AsyncOperationForm';

export default AsyncOperationForm;
