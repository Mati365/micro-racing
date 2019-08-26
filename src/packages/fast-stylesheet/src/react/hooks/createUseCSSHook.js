import {useRef} from 'react';

import {ssr} from '../../utils';

import criticalSheetStore from '../../criticalSheetStore';
import {useSheetStoreContext} from '../SheetStoreContextProvider';

const createUseCSSHook = (
  classes,
  {
    sheetStore = criticalSheetStore,
    critical = true,
    index = null,
    allowBaseWrap = true,
  } = {},
) => {
  const options = {
    index,
  };

  if (allowBaseWrap && !classes.base) {
    classes = {
      base: classes,
    };
  }

  // all styles with critical tags are loaded during app startup
  if (critical) {
    let sheet = (
      ssr
        ? sheetStore.injectRules(classes, options)
        : null
    );

    return () => {
      if (sheet === null)
        sheet = sheetStore.injectRules(classes, options);

      return sheet;
    };
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
