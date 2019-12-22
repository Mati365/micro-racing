import React from 'react';
import {usePromiseCallback} from '@pkg/basic-hooks';

const AsyncLockButton = ({component: Button, onClick, ...props}) => {
  const [_onClick, {loading}] = usePromiseCallback(onClick);

  return (
    <Button
      {...props}
      {...loading && {
        disabled: true,
      }}
      onClick={_onClick}
    />
  );
};

AsyncLockButton.displayName = 'AsyncLockButton';

export default AsyncLockButton;
