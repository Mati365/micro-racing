/* eslint-disable prefer-template */
import parseRules from '../parseRules';

export default class Sheet {
  constructor(id, styles, options) {
    this.id = id;
    this.options = options;
    this.injectedRulesCount = 0;
    this.usages = 1; // used in cache stylesheet removal

    // parse
    const {text, rules, classes} = this.parseStyles(styles);
    this.rules = rules;
    this.classes = classes;
    this.text = text;
  }

  get index() {
    return this.options.index;
  }

  generateClassName = () => {
    const {id, options} = this;

    return options.classNameGenerator(
      id,
      this.injectedRulesCount++,
    );
  }

  parseStyles(styles) {
    const parsedRules = parseRules(
      styles,
      this.generateClassName,
    );

    const classes = {};
    const rules = [];

    for (const className in parsedRules) {
      const rule = parsedRules[className];

      rules.push(rule.parsedRules);
      classes[className] = rule.className;
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
      classes,
    };
  }
}
