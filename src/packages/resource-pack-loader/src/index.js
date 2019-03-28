import * as R from 'ramda';
import {pairs, of} from 'rxjs';
import {scan, flatMap} from 'rxjs/operators';

import {
  promiseLoadImage,
  promiseLoadTextFile,
} from './helpers';

export const DEFAULT_LOADERS = [
  {
    test: R.test(/\.(png|jpe?g)$/),
    loader: promiseLoadImage,
  },
];

/**
 * Iterates over loaders array
 *
 * @param {Array} loaders
 * @param {String} path
 *
 * @returns {Function|Null}
 */
const findPathLoader = loaders => path => R.compose(
  R.unless(
    R.isNil,
    R.prop('loader'),
  ),
  R.find(
    ({test}) => test(path),
  ),
)(loaders);

/**
 * Load resources from path
 *
 * @param {Loader[]}  loaders
 * @param {String}    path
 *
 * @returns {Promise|Null}
 */
export const loadResource = loaders => path => R.compose(
  R.applyTo(path),
  R.unless(
    R.is(Function),
    R.always(promiseLoadTextFile),
  ),
  findPathLoader(loaders),
)(path);


/**
 * Creates asynchronous resource loader,
 * it accept array of loaders and creates function
 * that can load pack of data
 *
 * @param {Array} loaders
 * @param {Object} resources
 *
 * @returns {Object}
 */
const createResourcePackLoader = (loaders = DEFAULT_LOADERS) => {
  const packLoader = loadResource(loaders);

  return (resources) => {
    const totalResources = R.keys(resources).length;
    if (!totalResources) {
      return of(
        {
          resources: {},
          percentage: 1.0,
        },
      );
    }

    return (
      pairs(resources)
        .pipe(
          flatMap(
            async ([key, path]) => [key, await packLoader(path)],
          ),
          scan(
            (acc, [key, value]) => ({
              ...acc,
              percentage: ((R.keys(acc?.resources || {}).length + 1) / totalResources),
              resources: {
                ...acc?.resources,
                [key]: value,
              },
            }),
            {},
          ),
        )
    );
  };
};

/**
 * Creates loader that loads single resource
 *
 * @param {Array} loaders
 * @param {String} path
 *
 * @returns {Any}
 */
export const createSingleResourceLoader = (loaders = DEFAULT_LOADERS) => {
  const loaderPack = createResourcePackLoader(loaders);

  return async (path) => {
    const {resources} = await loaderPack(
      {
        current: path,
      },
    ).toPromise();

    return resources.current;
  };
};

export default createResourcePackLoader;
