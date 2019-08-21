import parseRules from '../parseRules';
import {createCounter} from '../utils';

/* eslint-disable prefer-template */
export default class DOMCssSheetStore {
  constructor(id, classNameGenerator) {
    this.id = id;
    this.classNameGenerator = classNameGenerator || createCounter(this.id);
  }

  injectRules = (classes) => {
    const injectedClasses = {};

    const node = document.head.appendChild(document.createElement('style'));
    node.setAttribute('type', 'text/css');
    node.setAttribute('stylesheet-store-id', this.id);

    const parsedRules = parseRules(classes, this.classNameGenerator);
    let acc = '';

    for (const className in parsedRules) {
      const rule = parsedRules[className];

      acc += '\n' + rule.text;
      injectedClasses[className] = rule.className;
    }

    acc += '\n';
    node.appendChild(
      document.createTextNode(acc),
    );

    return {
      sheetStore: this,
      classes: injectedClasses,
      node,
    };
  }
}
