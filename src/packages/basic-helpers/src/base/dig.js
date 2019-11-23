import * as R from 'ramda';

const dig = R.curry(
  (path, obj) => {
    if (!obj)
      return null;

    if (R.is(String, path))
      path = R.split('.', path);

    return R.view(R.lensPath(path), obj);
  },
);

export default dig;
