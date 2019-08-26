/* eslint-disable prefer-template */
import ssr from './utils/ssr';

import {
  HYDRATION_CACHE_VARIABLE,
  MAGIC_SSR_STORE_ID_ATTRIB,
} from './constants/magicFlags';

import {isEmptyObject} from './utils';
import {IsomorphicSheetStore} from './stores/types';

const createHydratedSheetStore = (constructParams) => {
  if (!ssr) {
    const globalStore = window[HYDRATION_CACHE_VARIABLE];
    const hydrationStore = globalStore?.[constructParams.id];

    if (hydrationStore) {
      constructParams.node = document.querySelector(`style[${MAGIC_SSR_STORE_ID_ATTRIB}]`);
      constructParams.cacheStore = {
        ...hydrationStore.sheetsClasses,
      };

      // cleanup store key
      delete globalStore[constructParams.id];

      // if list is empty - remove script holder
      if (isEmptyObject(globalStore)) {
        document
          .querySelector(`script[${MAGIC_SSR_STORE_ID_ATTRIB}]`)
          .remove();

        delete window[HYDRATION_CACHE_VARIABLE];
      }
    }
  }

  return new IsomorphicSheetStore(constructParams);
};

export default createHydratedSheetStore;
