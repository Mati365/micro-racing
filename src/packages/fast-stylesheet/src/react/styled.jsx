import React, {useRef} from 'react';

import criticalSheetStore from '../criticalSheetStore';
import {useSheetStoreContext} from './SheetStoreContextProvider';

import {createCounter} from '../utils';

const dynamicHooksCounter = createCounter('d');
const createUseCSSHook = (
  classes,
  {
    sheetStore = criticalSheetStore,
    critical = true,
    index = null,
  } = {},
) => {
  if (!classes.base) {
    classes = {
      base: classes,
    };
  }

  // all styles with critical tags are loaded during app startup
  if (critical) {
    const sheet = sheetStore.injectRules(classes, index);
    return () => sheet;
  }

  // all styles are created on demand
  // context based stylesheet, uses context api
  const dynamicSheetID = dynamicHooksCounter();

  return () => {
    const sheetRef = useRef(null);
    const contextSheetStore = useSheetStoreContext();

    if (sheetRef.current === null)
      sheetRef.current = contextSheetStore.injectRules(classes, index, dynamicSheetID);

    return sheetRef.current;
  };
};

const styled = (Tag, classes, params) => {
  const useCSS = createUseCSSHook(
    classes,
    params || {},
  );

  const Wrapped = React.forwardRef(({className, ...props}, ref) => {
    const injectedClasses = useCSS().classes;

    let generatedClassName = injectedClasses.base;
    if (className)
      generatedClassName += ' ' + className; // eslint-disable-line prefer-template

    return (
      <Tag
        {...props}
        ref={ref}
        className={generatedClassName}
      />
    );
  });

  Wrapped.displayName = 'Styled';

  return Wrapped;
};

[
  'input', 'textarea', 'button',
  'div', 'span',
  'a', 'table', 'td',
  'ul', 'li', 'ol',
  'header', 'section',
  'article', 'footer',
  'img',
].forEach(
  (tag) => {
    styled[tag] = (classes, params) => styled(tag, classes, params);
  },
);

export default styled;
