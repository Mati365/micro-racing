import * as R from 'ramda';

const getByID = (id, list) => (
  R.find(
    R.propEq('id', id),
    list,
  )
);

export default getByID;
