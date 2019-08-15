import * as R from 'ramda';

const safeArray = R.unless(
  R.is(Array),
  R.of,
);

export default safeArray;
