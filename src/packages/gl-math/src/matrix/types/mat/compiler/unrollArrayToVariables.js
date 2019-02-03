import * as R from 'ramda';

/**
 * Translates array with fixed length to single variable definitions
 *
 * @example
 *  var array = [1, 2, 3];
 *
 *  // unrollArrayToVariables('a', 'array')(3), is transformed to:
 *  var a0 = array[0], a1 = array[1], a2 = array[2];
 *
 * @param {String} variableNamePrefix
 * @param {String} arrayVariableName
 * @param {Number} length
 *
 * @returns {String}
 */
export const unrollArrayToVariables = (variableNamePrefix, arrayVariableName) => R.compose(
  definitions => `var ${definitions};`,
  R.join(','),
  R.times(
    index => `${variableNamePrefix}${index} = ${arrayVariableName}[${index}]`,
  ),
);

/**
 * Folds multiple variables from unrollArrayToVariables to single array
 *
 * @example
 *  var a0=1, a1=2, a2=3;
 *
 *  // foldUnrolledToArray(3, index => `a${index}`) transoforms to:
 *  [a1, a2]
 *
 * @param {String} arrayNamePrefix
 * @param {Number} w
 * @param {Function} mapperFn
 */
export const foldUnrolledToArray = (w, mapperFn = R.identity) => R.compose(
  str => `[${str}]`,
  R.join(','),
  R.times(
    index => mapperFn(index),
  ),
)(w);

/**
 * Create nested path array accessor and execute unrollArrayToVariables.
 * It generates multiple variables from array that are placed in nested object.
 * Just syntax sugar
 *
 * @example
 *  var m = {array: [1, 2, 3]};
 *
 *  // unrollNestedArrayToVariables('b', 'array', 3), is transformed to:
 *  var a_m = m.array;
 *  var b0 = a_m[0], b1 = a_m[1], b2 = a_m[2];
 *
 * @param {String} variableNamePrefix
 * @param {String} arrayPath
 * @param {Number} length
 *
 * @returns {String}
 */
export const unrollNestedArrayToVariables = (variableNamePrefix, arrayPath, length) => {
  const tmpAccessorName = `a_${variableNamePrefix}`;

  return R.trim(`
    var ${tmpAccessorName} = ${arrayPath};
    ${unrollArrayToVariables(variableNamePrefix, tmpAccessorName)(length)}
  `);
};
