/* eslint-disable prefer-template */
import {hashObject} from '../utils';

export const defaultClassNameGenerator = (sheetID, ruleIndex) => {
  const prefix = '_' + sheetID;
  if (ruleIndex)
    return prefix + '-' + ruleIndex.toString(36);

  return prefix;
};

export default class SheetStore {
  registry = []; // list of NON CACHED list of rules

  constructor({
    id,
    classNameGenerator = defaultClassNameGenerator,
    cacheStore = {},
  }) {
    this.id = id;

    this.cacheStore = cacheStore;
    this.classNameGenerator = classNameGenerator;
  }

  injectRules(styles, options) {
    // fill missing options params
    options = options || {};
    options.store = this;

    if (options.index === undefined)
      options.index = null;

    if (options.sheetID === undefined)
      options.sheetID = hashObject(styles);

    if (options.classNameGenerator === undefined)
      options.classNameGenerator = this.classNameGenerator;

    // lookup for cache
    const {sheetID} = options;
    const {cacheStore} = this;

    if (cacheStore) {
      let cachedSheet = this.cacheStore[sheetID];
      if (cachedSheet) {
        if (!('id' in cachedSheet)) {
          cachedSheet = {
            id: sheetID,
            usages: 1,
            classes: cachedSheet,
          };
        } else
          cachedSheet.usages++;

        return cachedSheet;
      }
    }

    // generate styles if cache not found
    const sheet = this.addToRegistry(
      this.createSheet(sheetID, styles, options),
    );

    if (cacheStore)
      cacheStore[sheetID] = sheet;

    return sheet;
  }

  addToRegistry(item) {
    this.registry.push(item);
    return item;
  }

  flushRegistry() {
    this.registry = [];
  }
}
