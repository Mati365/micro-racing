import * as R from 'ramda';

const valuesToPromisesList = mapperFn => R.compose(
  R.map(
    ([key, val]) => {
      let promise = mapperFn(val);
      if (!R.is(Promise, promise))
        promise = Promise.resolve(val || null);

      return promise.then(result => ([key, result]));
    },
  ),
  R.toPairs,
);

const nonNullPairsToObj = R.compose(
  R.fromPairs,
  R.reject(
    R.propSatisfies(R.isNil, 1),
  ), // remove nil values
);

/**
 * @param {Function}  mapperFn  Function that maps obj value to promise
 * @param {Object}    obj
 *
 * @example
 * {
 *  a: 'a',
 *  b: 'b',
 * }
 * transforms to:
 * {
 *  a: Promise() // with a
 *  b: Promise() // with b
 * }
 * and when object is returned when all promises are done
 */
const mapObjValuesToPromise = R.curry(
  (mapperFn, obj) => {
    const promises = valuesToPromisesList(mapperFn)(obj);

    return Promise
      .all(promises)
      .then(nonNullPairsToObj);
  },
);

export default mapObjValuesToPromise;
