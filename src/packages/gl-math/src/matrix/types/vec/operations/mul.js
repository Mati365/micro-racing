import * as R from 'ramda';

import {foldUnrolledToArray} from '../../mat/compiler/unrollArrayToVariables';
import createVector from '../createVector';

/**
 * Adds two vectors, sign allows to sub
 *
 * @param {Vector} vec1
 * @param {Vector} vec2
 *
 * @returns {Vector}
 */
export const mul = (number, vec1) => {
  const result = createVector(vec1.length);

  for (let i = vec1.length - 1; i >= 0; --i)
    result[i] = vec1[i] * number;

  return result;
};

/**
 * @param {Number} w
 *
 * @returns {Function}
 */
export const unrollMul = (w, number = null) => {
  const operations = foldUnrolledToArray(
    w,
    index => `vec1[${index}] * ${R.defaultTo('number', number)}`,
  );

  /* eslint-disable no-new-func */
  return new Function(
    ...[
      ...(
        R.isNil(number)
          ? ['number']
          : []
      ),
      'vec1',
    ],
    `
      return new __Vector(${operations});
    `,
  );
  /* eslint-enable no-new-func */
};
