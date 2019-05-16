import * as R from 'ramda';

const getIndexByName = (name, list) => (
  R.findIndex(
    R.propEq('name', name),
    list,
  )
);

export default getIndexByName;
