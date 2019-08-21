import {createCounter} from '../utils';
import parseRules from '../parseRules';

/* eslint-disable prefer-template */
export default class SheetStore {
  constructor(id, classNameGenerator) {
    this.id = id;
    this.classNameGenerator = classNameGenerator || createCounter(this.id);
  }

  parseRules(classes) {
    const injectedClasses = {};
    const parsedRules = parseRules(classes, this.classNameGenerator);
    let text = '';

    for (const className in parsedRules) {
      const rule = parsedRules[className];

      text += '\n' + rule.text;
      injectedClasses[className] = rule.className;
    }

    return [
      text,
      injectedClasses,
    ];
  }
}
