import {unrollArrayToVariables} from '../../mat/compiler/unrollArrayToVariables';

/**
 * Creates new function that is unrolled version of
 * looped vector operation, it should be faster than loop
 *
 * @param {Number} w
 * @param {Function} fn
 *
 * @returns {Function}
 */
const unrollVectorOperation = (w, fn) => (
  /* eslint-disable no-new-func */
  new Function(
    'vec',
    `
      ${unrollArrayToVariables('a', 'vec')(w)}
      ${fn()}
    `,
  )
  /* eslint-enable no-new-func */
);

export default unrollVectorOperation;
