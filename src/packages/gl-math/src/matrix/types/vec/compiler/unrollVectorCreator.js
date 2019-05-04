import * as R from 'ramda';
import '../../../../classes/Vector';

/**
 * Creates function that takes Nth params(w)
 * and creates from them array,
 *
 * @see
 *  fn(...arg) is not optimal, other es5 functions use slice
 *  and other stuff to make it done, precompile it!
 *
 * @param {Number} w
 *
 * @returns {Function}
 */
const unrollVectorCreator = (w) => {
  const args = R.times(index => `a${index}`, w);

  return (
    /* eslint-disable no-new-func */
    new Function(
      ...args,
      `return new __Vector([${R.join(',', args)}], 0, ${w})`,
    )
    /* eslint-enable no-new-func */
  );
};

export default unrollVectorCreator;
