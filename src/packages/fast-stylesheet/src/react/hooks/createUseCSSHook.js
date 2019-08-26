import {useRef} from 'react';

import criticalSheetStore from '../../criticalSheetStore';
import {useSheetStoreContext} from '../SheetStoreContextProvider';

const createUseCSSHook = (
  classes,
  {
    sheetStore = criticalSheetStore,
    critical = true,
    index = null,
  } = {},
) => {
  const options = {
    index,
  };

  if (!classes.base) {
    classes = {
      base: classes,
    };
  }

  // all styles with critical tags are loaded during app startup
  if (critical) {
    const sheet = sheetStore.injectRules(classes, options);
    return () => sheet;
  }

  return () => {
    const sheetRef = useRef(null);
    const contextSheetStore = useSheetStoreContext();

    if (sheetRef.current === null)
      sheetRef.current = contextSheetStore.injectRules(classes, options);

    return sheetRef.current;
  };
};

export default createUseCSSHook;
