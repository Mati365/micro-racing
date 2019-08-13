import * as R from 'ramda';

export const removeByProp = propName => (propValue, list) => R.reject(
  R.propEq(propName, propValue),
  list,
);

const removeByID = removeByProp('id');

export default removeByID;
