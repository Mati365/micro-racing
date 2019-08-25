import {useRef} from 'react';

import criticalSheetStore from '../../criticalSheetStore';
import {useSheetStoreContext} from '../SheetStoreContextProvider';

import {createCounter} from '../../utils';

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

export default createUseCSSHook;
