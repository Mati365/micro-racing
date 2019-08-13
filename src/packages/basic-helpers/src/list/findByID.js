import * as R from 'ramda';

export const findByProp = prop => (propValue, list) => (
  R.find(
    R.propEq(prop, propValue),
    list,
  )
);

const findByID = findByProp('id');

export default findByID;
