import * as R from 'ramda';

const removeNullValues = R.pickBy(
  R.complement(R.isNil),
);

export default removeNullValues;
