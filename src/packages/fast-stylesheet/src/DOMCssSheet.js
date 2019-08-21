import parseRules from './parseRules';

/* eslint-disable prefer-template */
export default class DOMCssSheet {
  static id = 0;

  constructor(classes, classNameGenerator) {
    this.id = ++DOMCssSheet.id;

    const parsedRules = parseRules(
      classes,
      classNameGenerator
        ? (...args) => classNameGenerator(this.id, ...args)
        : (() => 'c' + this.id),
    );

    this.node = document.head.appendChild(document.createElement('style'));
    this.node.setAttribute('css-dynamic-injected', true);

    this.injectedClasses = {};

    let acc = '';
    for (const className in parsedRules) {
      const rule = parsedRules[className];

      acc += rule.text + '\n';
      this.injectedClasses[className] = rule.className;
    }

    this.node.appendChild(
      document.createTextNode(acc),
    );
  }

  unmount() {
    this.node.remove();
  }
}
