import {
  isUnitLessProp,
  camelCaseToDash,
} from './utils';

/* eslint-disable prefer-template */
const GLOBAL_CLASS_NAME = '@global';

const wrapWithSelector = (selector, content) => {
  if (!content)
    return '';

  return selector + ' {' + content + '}';
};

/**
 * Converts value from array to single string
 * or digit to pixels
 *
 * @param {String} ruleName
 * @param {Any} value
 */
const toRuleValue = (ruleName, value) => {
  if (ruleName !== null && Number.isFinite(value) && !isUnitLessProp(ruleName))
    return value + 'px';

  if (Array.isArray(value)) {
    let acc = '';
    for (let i = 0, l = value.length - 1; i < l; ++i)
      acc += toRuleValue(null, value[i]) + ' ';

    return acc;
  }

  return value;
};

const generateRule = (selectorName, rules) => {
  let content = '';
  let nestedRulesContent = '';

  for (const ruleName in rules) {
    const ruleValue = rules[ruleName];

    if (ruleValue === null)
      continue;

    switch (ruleName[0]) {
      /** & > *, & *, & tags */
      case '&': {
        const nestedRuleSelector = ruleName.replace(/&/g, selectorName);
        nestedRulesContent += '\n' + generateRule(nestedRuleSelector, ruleValue);
      } break;

      /** @media @global tags */
      case '@':
        if (ruleName === GLOBAL_CLASS_NAME)
          nestedRulesContent += '\n' + generateRule('', ruleValue);
        else {
          const wrappedRuleContent = generateRule(selectorName, ruleValue);
          nestedRulesContent += '\n' + wrapWithSelector(ruleName, wrappedRuleContent);
        }
        break;

      /** normal tags */
      default:
        content += camelCaseToDash(ruleName) + ':' + toRuleValue(ruleName, ruleValue) + ';';
        break;
    }
  }

  return wrapWithSelector(selectorName, content) + nestedRulesContent;
};

/**
 * Converts css classes to CSS Rule string and generated class name
 *
 * @param {Object} classes
 * @param {Object} classNameGenerator
 */
const parseRules = (classes, classNameGenerator) => {
  const stylesheet = {};
  let globals = 0;

  for (const className in classes) {
    if (className === GLOBAL_CLASS_NAME) {
      const globalMappedName = 'global-' + (++globals);

      stylesheet[globalMappedName] = {
        className: globalMappedName,
        text: generateRule('', classes[className]),
      };
    } else {
      let rules = classes[className];

      /**
       * Handle optional compression of class names
       */
      const generatedClassName = (
        classNameGenerator
          ? classNameGenerator(className)
          : className
      );

      /**
       * handle composition of CSS classes
       *
       * @example
       *  {class: {composes: ['a']}} => 'a class' in element tag
       */
      let tagClassName = generatedClassName;
      if (rules.composes) {
        const {composes, ...nonComposeRules} = rules;

        rules = nonComposeRules;
        tagClassName = composes.join(' ') + ' ' + generatedClassName;
      }

      stylesheet[className] = {
        className: tagClassName,
        text: generateRule('.' + generatedClassName, rules),
      };
    }
  }

  return stylesheet;
};

export default parseRules;
