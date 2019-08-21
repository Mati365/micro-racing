import DOMSheetStore from './DOMSheetStore';
import SSRSheetStore from './SSRSheetStore';

export {
  DOMSheetStore,
  SSRSheetStore,
};

export const IsomorphicSheetStore = (
  typeof document !== 'undefined'
    ? DOMSheetStore
    : SSRSheetStore
);
