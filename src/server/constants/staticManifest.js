import * as R from 'ramda';
import {resolve} from 'path';

// eslint-disable-next-line no-undef
const getStaticManifest = R.once(() => __non_webpack_require__(
  resolve(__dirname, '../public/public-manifest.json'),
));

/**
 * Due to webpack compilation issues load on demand manifest
 */
export default new Proxy(
  {},
  {
    get(target, name) {
      return getStaticManifest()[name];
    },
  },
);
