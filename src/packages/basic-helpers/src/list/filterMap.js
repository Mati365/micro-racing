import * as R from 'ramda';

const filterMap = R.curry(
  (mapperFn, array) => R.addIndex(R.reduce)(
    (acc, item, index) => {
      const mapped = mapperFn(item, index);
      if (mapped !== null)
        acc.push(mapped);

      return acc;
    },
    [],
    array,
  ),
);

export default filterMap;
