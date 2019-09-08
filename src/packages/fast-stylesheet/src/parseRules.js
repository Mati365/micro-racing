import {
  isUnitLessProp,
  camelCaseToDash,
  nestedShallowExtend,
} from './utils';

/* eslint-disable prefer-template, no-restricted-syntax, guard-for-in, no-continue */
const GLOBAL_CLASS_NAME = '@global';
const KEYFRAMES_CLASS_NAME = '@keyframes';
const MEDIA_CLASS_NAME = '@media';

const EXTEND_KEYWORD = 'extend';
const COMPOSE_KEYWORD = 'composes';

const wrapWithSelector = (selector, content) => {
  if (!content)
    return '';

  return selector + ' {' + content + '}';
};

/**
 * Assigns extended css to rules
 *
 * @param {Object} extend
 * @param {Object} rules
 *
 * @example
 * {
 *    extend: {background: 'red'},
 *    opacity: 0.5,
 * } => {opcity: 0.25, background: 'red'}
 *
 */
const assignExtendRule = (extend, rules) => {
  if (!extend)
    return rules;

  if (!Array.isArray(extend))
    extend = [extend];

  return nestedShallowExtend(...extend, rules);
};

/**
 * Merges composes class names to tagClassName
 *
 * @param {Object} stylesheet
 * @param {Any} composes
 * @param {String} tagClassName
 */
const appendComposedClassNames = (stylesheet, composes, tagClassName) => {
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

  return tagClassName;
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
      acc += toRuleValue(ruleName, value[i]);
      if (i + 1 < l)
        acc += ' ';
    }

    return acc;
  }

  return value;
};

/**
 * Replaces & > * with .test > *
 *
 * @param {String} ruleName
 * @param {String} selectorName
 */
const insertSelectorToRuleName = (ruleName, selectorName) => {
  // empty selectors can cause weird glitches in & > * ruless
  // example: "& > a" becamse " > a", fix it removing spaces after character
  const nextedRulesReplaceRegex = selectorName ? /&/g : /&\s*/g;

  return (
    ruleName
      .replace(/(,)(\s+)([^&])/g, '$1 ' + selectorName + ' $3')
      .replace(nextedRulesReplaceRegex, selectorName)
  );
};

const generateRule = (selectorName, rules, output = []) => {
  let content = '';

  /** handle extend */
  if (EXTEND_KEYWORD in rules) {
    rules = assignExtendRule(rules[EXTEND_KEYWORD], rules);
    delete rules[EXTEND_KEYWORD];
  }

  for (const ruleName in rules) {
    const ruleValue = rules[ruleName];

    if (ruleValue === null)
      continue;

    switch (ruleName[0]) {
      /** & > *, & *, & tags */
      case '&': {
        const nestedRuleSelector = insertSelectorToRuleName(ruleName, selectorName);

        generateRule(nestedRuleSelector, ruleValue, output);
      } break;

      /** @media @global tags */
      case '@':
        if (ruleName === GLOBAL_CLASS_NAME) {
          // eslint-disable-next-line no-use-before-define
          output = [...output, parseGlobalRule(ruleValue)];
        } else {
          const wrappedRuleContent = generateRule(selectorName, ruleValue).join(' ');

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

  if (selectorName && content) {
    output.unshift(
      wrapWithSelector(selectorName, content),
    );
  }

  return output;
};

/**
 * Handles @global rules and generated parsed rules array
 *
 * @param {Object} rules
 * @param {Boolean} generateClassSelector
 *
 * @returns {Array} rules
 */
const parseGlobalRule = (rules, generateClassSelector = false) => {
  // eslint-disable-next-line no-use-before-define
  const parsedClasses = parseRules(rules, null, generateClassSelector);
  const parsedRules = [];

  for (const parsedClassName in parsedClasses) {
    parsedRules.push(
      ...parsedClasses[parsedClassName].parsedRules,
    );
  }

  return parsedRules;
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
 * @param {String} generateClassSelector
 *
 * @returns {Array}
 */
const parseRules = (classes, classNameGenerator, generateClassSelector = true) => {
  const stylesheet = {};
  let globals = 0;

  for (const className in classes) {
    const rules = classes[className];

    /** handle @* tags */
    if (className[0] === '@') {
      /** handle @global */
      if (className === GLOBAL_CLASS_NAME) {
        const globalMappedName = 'global-' + (++globals);

        stylesheet[globalMappedName] = {
          className: globalMappedName,
          parsedRules: parseGlobalRule(rules),
        };

      /** handle @media - it can contain nested classes */
      } else if (className.indexOf(MEDIA_CLASS_NAME) === 0) {
        const mediaRules = parseRules(rules, classNameGenerator);
        for (const key in mediaRules) {
          const mediaRule = mediaRules[key];
          mediaRule.parsedRules = mediaRule.parsedRules.map(
            ruleContent => wrapWithSelector(className, ruleContent),
          );
        }

        Object.assign(stylesheet, mediaRules);

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
        classNameGenerator
          ? classNameGenerator(className)
          : className
      );

      let tagClassName = generatedClassName;
      let selectorName = tagClassName;

      if (generateClassSelector)
        selectorName = '.' + tagClassName;

      /**
       * handle composition of CSS classes
       *
       * @example
       *  {class: {composes: ['a']}} => 'a class' in element tag
       */

      /** handle composes */
      if (COMPOSE_KEYWORD in rules) {
        tagClassName = appendComposedClassNames(stylesheet, rules[COMPOSE_KEYWORD], tagClassName);
        delete rules[COMPOSE_KEYWORD];
      }

      stylesheet[className] = {
        className: tagClassName,
        parsedRules: generateRule(selectorName, rules),
      };
    }
  }

  return stylesheet;
};

export default parseRules;
