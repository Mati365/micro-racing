import * as R from 'ramda';

const getIndexBy = prop => (value, list) => (
  R.findIndex(
    R.propEq(prop, value),
    list,
  )
);

export default getIndexBy;
