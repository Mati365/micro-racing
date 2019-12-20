import React, {useEffect, useRef} from 'react';

const AutofocusInput = ({children}) => {
  const inputRef = useRef(null);

  useEffect(
    () => {
      const {current: node} = inputRef;
      if (node)
        node.focus();
    },
    [inputRef.current],
  );

  return React.cloneElement(
    React.Children.only(children),
    {
      ref: inputRef,
    },
  );
};

export default AutofocusInput;
