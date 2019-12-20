import React from 'react';

import {
  usePromiseCallback,
  useInputs,
} from '@ui/basic-hooks';

const AsyncOperationForm = ({onSubmit, initialData, children, ...props}) => {
  const [_onSubmit, promiseState] = usePromiseCallback(onSubmit);
  const {l, value} = useInputs(
    {
      initialData,
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
        },
      )}
    </form>
  );
};

AsyncOperationForm.displayName = 'AsyncOperationForm';

export default AsyncOperationForm;
