import ssr from '../../utils/ssr';

import DOMSheetStore from './DOMSheetStore';
import SSRSheetStore from './SSRSheetStore';

export {
  DOMSheetStore,
  SSRSheetStore,
};

export const IsomorphicSheetStore = (
  ssr
    ? SSRSheetStore
    : DOMSheetStore
);
