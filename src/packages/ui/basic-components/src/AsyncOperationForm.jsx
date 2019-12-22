import React, {useRef} from 'react';

import {
  usePromiseCallback,
  useForceRerender,
  useInputs,
} from '@ui/basic-hooks';

const AsyncOperationForm = ({onSubmit, initialData, children, ...props}) => {
  const [_onSubmit, promiseState] = usePromiseCallback(onSubmit);
  const forceRerender = useForceRerender();
  const modifiedFlagRef = useRef(false);

  const {l, value, setValue} = useInputs(
    {
      initialData,
      onChange: () => {
        modifiedFlagRef.current = true;
      },
    },
  );

  const onAsyncSubmit = async (e) => {
    e.preventDefault();

    // trigger force rerender
    await _onSubmit(value);
    modifiedFlagRef.current = false;
    forceRerender();
  };

  return (
    <form
      {...props}
      onSubmit={onAsyncSubmit}
    >
      {children(
        {
          l,
          value,
          setValue,
          promiseState,
          modified: modifiedFlagRef.current,
        },
      )}
    </form>
  );
};

AsyncOperationForm.displayName = 'AsyncOperationForm';

export default AsyncOperationForm;
