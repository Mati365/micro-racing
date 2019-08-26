/* eslint-disable prefer-template, no-restricted-syntax, guard-for-in, no-continue */

/**
 *
 * @param {Object} target
 * @param {Object} src
 */
const recursiveShallowExtend = (target, src, allowExtendKeyword = true) => {
  for (const key in src) {
    const value = src[key];
    if (allowExtendKeyword && key === 'extend') {
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; ++i)
          recursiveShallowExtend(target, value[i]);
      } else
        recursiveShallowExtend(target, value);
    } else {
      switch (typeof value) {
        case 'string':
        case 'number':
          target[key] = value;
          break;

        case 'object':
          if (Array.isArray(value))
            target[key] = value;
          else {
            target[key] = recursiveShallowExtend(
              target[key] || {},
              value,
            );
          }
          break;

        default:
      }
    }
  }
  return target;
};

const nestedShallowExtend = (...src) => {
  const target = {};
  for (let i = 0, l = src.length; i < l; ++i)
    recursiveShallowExtend(target, src[i]);

  return target;
};

export default nestedShallowExtend;
