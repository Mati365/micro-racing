import * as R from 'ramda';

/**
 * Adds leading 0 to date
 *
 * @example
 * 0 => 01
 * 10 => 10
 */
export default R.curry(
  (last, number) => `${'0'.repeat(last)}${number}`.slice(-last),
);
