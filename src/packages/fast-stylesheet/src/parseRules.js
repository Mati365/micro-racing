import {
  isUnitLessProp,
  camelCaseToDash,
} from './utils';

/* eslint-disable prefer-template */
const GLOBAL_CLASS_NAME = '@global';
const KEYFRAMES_CLASS_NAME = '@keyframes';

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
    for (let i = 0, l = value.length; i < l; ++i) {
      acc += toRuleValue(null, value[i]);
      if (i + 1 < l)
        acc += ' ';
    }

    return acc;
  }

  return value;
};

const generateRule = (selectorName, rules, output = []) => {
  let content = '';

  // empty selectors can cause weird glitches in & > * ruless
  // example: "& > a" becamse " > a", fix it removing spaces after character
  const nextedRulesReplaceRegex = selectorName ? /&/g : /&\s*/g;

  for (const ruleName in rules) {
    const ruleValue = rules[ruleName];

    if (ruleValue === null)
      continue;

    switch (ruleName[0]) {
      /** & > *, & *, & tags */
      case '&': {
        const nestedRuleSelector = ruleName.replace(
          nextedRulesReplaceRegex,
          selectorName,
        );

        generateRule(nestedRuleSelector, ruleValue, output);
      } break;

      /** @media @global tags */
      case '@':
        if (ruleName === GLOBAL_CLASS_NAME) {
          generateRule('', ruleValue, output);
        } else {
          const wrappedRuleContent = generateRule(selectorName, ruleValue);

          output.push(
            wrapWithSelector(ruleName, wrappedRuleContent),
          );
        }
        break;

      /** normal tags */
      default:
        content += camelCaseToDash(ruleName) + ':' + toRuleValue(ruleName, ruleValue) + ';';
        break;
    }
  }

  content && output.unshift(
    wrapWithSelector(selectorName, content),
  );

  return output;
};

/**
 * Converts object with keyframes to CSS rule
 *
 * @param {String} selector
 * @param {Object} rules
 *
 * @returns {Array}
 */
const parseKeyframesRule = (selector, rules) => {
  const name = selector.substring(selector.indexOf(' ') + 1);
  const parsedRules = [];

  for (const percentage in rules)
    parsedRules.push(generateRule(percentage, rules[percentage]));

  return [
    name,
    wrapWithSelector(selector, parsedRules.join(' ')),
  ];
};

/**
 * Converts css classes to CSS Rule string and generated class name
 *
 * @param {Object} classes
 * @param {Object} classNameGenerator
 *
 * @returns {Array}
 */
const parseRules = (classes, classNameGenerator) => {
  const stylesheet = {};
  let globals = 0;

  for (const className in classes) {
    let rules = classes[className];

    /** handle @* tags */
    if (className[0] === '@') {
      /** handle @global */
      if (className === GLOBAL_CLASS_NAME) {
        const globalMappedName = 'global-' + (++globals);

        stylesheet[globalMappedName] = {
          className: globalMappedName,
          parsedRules: [generateRule('', rules)],
        };

      /** handle @keyframes */
      } else if (className.indexOf(KEYFRAMES_CLASS_NAME) === 0) {
        const [name, text] = parseKeyframesRule(className, rules);
        stylesheet[name] = {
          className: name,
          parsedRules: [text],
        };
      }

    /** handle class name */
    } else {
      /**
       * Handle optional compression of class names
       */
      const generatedClassName = (
        classNameGenerator !== undefined
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

      let {extend, composes} = rules;
      if (extend || composes) {
        rules = {...rules};
        delete rules.extend;
        delete rules.composes;
      }

      /** handle extend */
      if (rules.extend) {
        if (typeof extend === 'string')
          extend = [extend];

        Object.assign(rules, ...extend);
      }

      /** handle composes */
      if (composes) {
        // transform strings to array
        if (typeof composes === 'string')
          composes = composes.split(' ');

        // handle arrays
        for (let i = composes.length - 1; i >= 0; --i) {
          let composedClass = composes[i];

          /** handle $classA, $classB */
          if (composedClass[0] === '$')
            composedClass = stylesheet[composedClass.substring(1)]?.className;

          if (composedClass)
            tagClassName = composedClass + ' ' + tagClassName;
        }
      }

      stylesheet[className] = {
        className: tagClassName,
        parsedRules: generateRule('.' + generatedClassName, rules),
      };
    }
  }

  return stylesheet;
};

export default parseRules;
