import * as R from 'ramda';

/**
 * Gets value of input from event,
 * otherwise return passed object
 */
export default R.unless(
  R.either(R.isNil, R.is(String)),
  R.ifElse(
    R.has('target'),
    R.compose(
      R.ifElse(
        R.propEq('type', 'checkbox'),
        R.prop('checked'),
        R.prop('value'),
      ),
      R.prop('target'),
    ),
    R.identity,
  ),
);
