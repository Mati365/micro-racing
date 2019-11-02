import * as R from 'ramda';

const dig = R.curry(
  (path, obj) => R.view(R.lensPath(path), obj),
);

export default dig;
