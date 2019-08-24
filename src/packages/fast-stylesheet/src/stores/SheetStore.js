import {createCounter} from '../utils';
import parseRules from '../parseRules';

/* eslint-disable prefer-template */
export default class SheetStore {
  registry = []; // list of NON CACHED list of rules

  sheetIdGenerator = createCounter('s');

  constructor({
    id,
    classNameGenerator,
    initialClassNameGeneratorValue = 0,
    cacheStore = {},
  }) {
    this.id = id;

    this.cacheStore = cacheStore;
    this.classNameGenerator = (
      classNameGenerator
        ? classNameGenerator(initialClassNameGeneratorValue)
        : createCounter(this.id, initialClassNameGeneratorValue)
    );
  }

  injectRules(classes, index = null, sheetID = null) {
    const {cacheStore} = this;

    if (sheetID === null)
      sheetID = this.sheetIdGenerator();

    if (cacheStore) {
      let cachedSheet = this.cacheStore[sheetID];
      if (cachedSheet) {
        if (!('id' in cachedSheet)) {
          cachedSheet = {
            id: sheetID,
            classes: cachedSheet,
          };
        }

        return cachedSheet;
      }
    }

    const parseResult = this.parseRules(classes);
    const sheet = this.addToRegistry(
      this.createSheet(sheetID, parseResult, index),
    );

    if (cacheStore)
      cacheStore[sheetID] = sheet;

    return sheet;
  }

  parseRules(classes) {
    const parsedRules = parseRules(classes, this.classNameGenerator);

    const injectedClasses = {};
    const rules = [];

    for (const className in parsedRules) {
      const rule = parsedRules[className];

      rules.push(rule.parsedRules);
      injectedClasses[className] = rule.className;
    }

    let text = '';
    rules.forEach((rulesArray) => {
      rulesArray.forEach((rule) => {
        text += rule + ' ';
      });
    });

    return {
      text,
      rules,
      injectedClasses,
    };
  }

  addToRegistry(item) {
    this.registry.push(item);
    return item;
  }

  flushRegistry() {
    this.registry = [];
  }
}
