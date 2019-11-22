import * as R from 'ramda';
import {createSingleResourceLoader} from '@pkg/resource-pack-loader';

const fetchCachedTexture = R.memoizeWith(
  R.identity,
  createSingleResourceLoader(),
);

export default fetchCachedTexture;
