import {
  foldUnrolledToArray,
  unrollArrayToVariables,
} from '../../mat/compiler/unrollArrayToVariables';

import createVector from '../createVector';

/**
 * @see {@link https://en.wikipedia.org/wiki/Linear_interpolation}
 *
 * @param {Vector} vec1
 * @param {Vector} vec2
 * @param {Number} t
 *
 * @returns {Vector}
 */
export const lerp = (vec1, vec2, t) => {
  const result = createVector(vec1.length);

  for (let i = vec1.length - 1; i >= 0; --i) {
    const _v1 = vec1[i];
    result[i] = _v1 + (vec2[i] - _v1) * t;
  }

  return result;
};

/**
 * @param {Number} w
 *
 * @returns {Function}
 */
export const unrollLerp = (w) => {
  const operations = foldUnrolledToArray(
    w,
    index => `a${index} + (vec2[${index}] - a${index}) * t`,
  );

  /* eslint-disable no-new-func */
  return new Function(
    'vec1',
    'vec2',
    't',
    `
      ${unrollArrayToVariables('a', 'vec1')(w)}
      return new Float32Array(${operations});
    `,
  );
  /* eslint-enable no-new-func */
};
