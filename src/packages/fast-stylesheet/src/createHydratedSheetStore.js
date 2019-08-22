/* eslint-disable prefer-template */
import ssr from './utils/ssr';

import {
  HYDRATION_CACHE_VARIABLE,
  MAGIC_HYDRATED_STORE_ID_ATTRIB,
} from './constants/magicFlags';

import {IsomorphicSheetStore} from './stores/types';

const createHydratedSheetStore = (constructParams) => {
  if (!ssr) {
    const hydrationStore = window[HYDRATION_CACHE_VARIABLE]?.[constructParams.id];

    if (hydrationStore) {
      constructParams.initialClassNameGeneratorValue = hydrationStore.classGeneratorValue;
      constructParams.cacheStore = {
        ...hydrationStore.sheetsClasses,
      };

      // cleanup stuff
      delete window[HYDRATION_CACHE_VARIABLE];
      document
        .querySelector(`script[${MAGIC_HYDRATED_STORE_ID_ATTRIB}='${constructParams.id}']`)
        .remove();
    }
  }

  return new IsomorphicSheetStore(constructParams);
};

export default createHydratedSheetStore;
